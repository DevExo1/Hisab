/**
 * API Client for Hisab Mobile App
 * Reused from web with React Native adaptations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.10.10.150:8000'; // Will be configured for production

class ApiClient {
  constructor() {
    this.baseURL = API_URL;
  }

  async getAuthHeaders() {
    const token = await AsyncStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  }

  async request(endpoint, options = {}) {
    const headers = await this.getAuthHeaders();
    const config = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    try {
      if (options.body) {
      }
      
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        
        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401) {
          await this.logout();
          const error = new Error('Session expired. Please login again.');
          error.isAuthError = true;
          throw error;
        }
        
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          // Not JSON, use text as is
        }
        
        const errorMessage = errorData.detail || errorText || `HTTP ${response.status}`;
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      // Network errors (no internet, server unreachable)
      if (error.message === 'Network request failed' || error.message.includes('Failed to fetch')) {
        const netError = new Error('No internet connection. Please check your network.');
        netError.isNetworkError = true;
        throw netError;
      }
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${this.baseURL}/api/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await response.json();
    await AsyncStorage.setItem('token', data.access_token);
    return data;
  }

  async register(userData) {
    return this.request('/api/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    await AsyncStorage.removeItem('token');
  }

  // User endpoints
  async getCurrentUser() {
    return this.request('/api/users/me');
  }

  async updateProfile(updates) {
    return this.request('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Friends endpoints
  async getFriends() {
    try {
      const friends = await this.request('/api/friends/');
      // Return friends without balance calculation for now
      // Balance calculation causes HTTP 500 errors
      return friends.map(f => ({ ...f, balance: 0 }));
    } catch (error) {
      return [];
    }
  }

  async addFriend(friendData) {
    return this.request('/api/friends/', {
      method: 'POST',
      body: JSON.stringify(friendData),
    });
  }

  // Groups endpoints
  async getGroups() {
    const groups = await this.request('/api/groups/');
    
    // Get current user once at the beginning
    let currentUser = null;
    try {
      currentUser = await this.getCurrentUser();
    } catch (error) {
    }
    
    // Fetch balances for each group
    const groupsWithBalances = await Promise.all(
      groups.map(async (group) => {
        try {
          const balanceData = await this.request(`/api/groups/${group.id}/balances`);
          // Calculate user's balance in this group
          let userBalance = 0;
          
          if (currentUser && balanceData.balances) {
            const userBalanceObj = balanceData.balances.find(b => b.user_id === currentUser.id);
            if (userBalanceObj) {
              userBalance = userBalanceObj.balance;
            }
          }
          
          return {
            ...group,
            balance: userBalance,
            balances: balanceData.balances || [],
            settlements: balanceData.settlements || [],
          };
        } catch (error) {
          return {
            ...group,
            balance: 0,
            balances: [],
            settlements: [],
          };
        }
      })
    );
    
    return groupsWithBalances;
  }

  async createGroup(groupData) {
    return this.request('/api/groups/', {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  }

  async updateGroup(groupId, updates) {
    return this.request(`/api/groups/${groupId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getGroupBalances(groupId) {
    return this.request(`/api/groups/${groupId}/balances`);
  }

  async getGroupPairwiseBalances(groupId) {
    return this.request(`/api/groups/${groupId}/pairwise-balances`);
  }

  async getGroupSettlements(groupId) {
    return this.request(`/api/groups/${groupId}/settlements`);
  }

  // Expenses endpoints
  async getExpenses() {
    return this.request('/api/expenses/');
  }

  async getExpenseSplits(expenseId) {
    return this.request(`/api/expenses/${expenseId}/splits`);
  }

  async createExpense(expenseData) {
    return this.request('/api/expenses/', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  }

  // Settlements endpoints
  async createSettlement(settlementData) {
    return this.request('/api/settlements/', {
      method: 'POST',
      body: JSON.stringify(settlementData),
    });
  }

  async getActivity(limit = 20, offset = 0) {
    return this.request(`/api/activity?limit=${limit}&offset=${offset}`);
  }

  // Sync endpoint
  async getSyncChanges(sinceTimestamp = null) {
    const endpoint = sinceTimestamp
      ? `/api/sync/changes?since=${encodeURIComponent(sinceTimestamp)}`
      : '/api/sync/changes';
    return this.request(endpoint);
  }
}

export default new ApiClient();
