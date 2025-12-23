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
    console.log('Getting auth headers, token exists:', !!token);
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
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
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
    console.log('Token saved successfully:', data.access_token.substring(0, 20) + '...');
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
      console.error('Failed to fetch friends:', error);
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
      console.log('Could not get current user for balance calculation');
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
          console.error(`Failed to fetch balance for group ${group.id}:`, error);
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

  // Expenses endpoints
  async getExpenses() {
    return this.request('/api/expenses/');
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

  async getActivity() {
    return this.request('/api/activity');
  }
}

export default new ApiClient();
