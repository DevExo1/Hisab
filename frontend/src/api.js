/**
 * API Service for Emergent Splitwise
 * Handles all communication with the backend API
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ============================================
// Authentication APIs
// ============================================

export const authAPI = {
  /**
   * Login user and get JWT token
   * @param {string} email - User email
   * @param {string} password - User password
   */
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await axios.post(`${API_URL}/token`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    return access_token;
  },

  /**
   * Register a new user
   * @param {string} name - User's full name
   * @param {string} email - User email
   * @param {string} password - User password
   */
  register: async (name, email, password) => {
    const response = await api.post('/users/', {
      name,
      email,
      password,
    });
    return response.data;
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

// ============================================
// User APIs
// ============================================

export const userAPI = {
  /**
   * Get current user profile
   */
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },

  /**
   * Update current user profile (name and/or password)
   * @param {{name?: string, password?: string}} updateData
   */
  updateProfile: async (updateData) => {
    const response = await api.put('/users/me', updateData);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },

  /**
   * Get cached user from localStorage
   */
  getCachedUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

// ============================================
// Group APIs
// ============================================

// ============================================
// Friends APIs
// ============================================

export const friendsAPI = {
  /**
   * Get current user's friends
   */
  getFriends: async () => {
    const response = await api.get('/friends/');
    return response.data;
  },

  /**
   * Add friend by email
   * @param {string} friendEmail
   */
  addFriend: async (friendEmail) => {
    const response = await api.post('/friends/', {
      friend_email: friendEmail,
    });
    return response.data;
  },
};

// ============================================
// Activity APIs
// ============================================

export const activityAPI = {
  /**
   * Get recent activity for current user
   */
  getActivity: async () => {
    const response = await api.get('/activity');
    return response.data;
  },
};

// ============================================
// Group APIs
// ============================================

export const groupAPI = {
  /**
   * Get all groups for current user
   */
  getGroups: async () => {
    const response = await api.get('/groups/');
    return response.data;
  },

  /**
   * Get specific group details
   * @param {number} groupId - Group ID
   */
  getGroup: async (groupId) => {
    const response = await api.get(`/groups/${groupId}`);
    return response.data;
  },

  /**
   * Create a new group
   * @param {string} name - Group name
   * @param {number[]} memberIds - Array of user IDs to add as members
   * @param {string} currency - Group currency code (default: USD)
   */
  createGroup: async (name, memberIds, currency = 'USD') => {
    const response = await api.post('/groups/', {
      name,
      member_ids: memberIds,
      currency: currency,
    });
    return response.data;
  },

  /**
   * Get balances for a group
   * @param {number} groupId - Group ID
   */
  getGroupBalances: async (groupId) => {
    const response = await api.get(`/groups/${groupId}/balances`);
    return response.data;
  },

  /**
   * Get detailed pairwise balances for a group
   * @param {number} groupId - Group ID
   */
  getGroupPairwiseBalances: async (groupId) => {
    const response = await api.get(`/groups/${groupId}/pairwise-balances`);
    return response.data;
  },

  /**
   * Get expenses for a group
   * @param {number} groupId - Group ID
   */
  getGroupExpenses: async (groupId) => {
    const response = await api.get(`/groups/${groupId}/expenses`);
    return response.data;
  },

  /**
   * Update an existing group
   * @param {number} groupId - Group ID
   * @param {string} name - Updated group name
   * @param {number[]} memberIds - Array of user IDs to be members
   * @param {string} currency - Group currency code (default: USD)
   */
  updateGroup: async (groupId, name, memberIds, currency = 'USD') => {
    const response = await api.put(`/groups/${groupId}`, {
      name,
      member_ids: memberIds,
      currency: currency,
    });
    return response.data;
  },
};

// ============================================
// Expense APIs
// ============================================

export const expenseAPI = {
  /**
   * Create a new expense
   * @param {Object} expenseData - Expense data
   */
  createExpense: async (expenseData) => {
    const response = await api.post('/expenses/', {
      description: expenseData.description,
      amount: parseFloat(expenseData.amount),
      group_id: expenseData.groupId,
      paid_by_user_id: expenseData.paidByUserId,
      split_type: expenseData.splitType,
      splits: expenseData.splits, // Object mapping user_id to amount/percentage
    });
    return response.data;
  },

  /**
   * Get expense split details
   * @param {number} expenseId - Expense ID
   */
  getExpenseSplits: async (expenseId) => {
    const response = await api.get(`/expenses/${expenseId}/splits`);
    return response.data;
  },
};

// ============================================
// Settlement APIs
// ============================================

export const settlementAPI = {
  /**
   * Record a settlement (payment) between users
   * @param {Object} settlementData - Settlement data
   */
  recordSettlement: async (settlementData) => {
    const response = await api.post('/settlements/', {
      group_id: settlementData.groupId,
      payer_id: settlementData.payerId,
      payee_id: settlementData.payeeId,
      amount: parseFloat(settlementData.amount),
      notes: settlementData.notes || null,
    });
    return response.data;
  },
};

// ============================================
// Helper Functions
// ============================================

/**
 * Calculate overall balance from groups
 * @param {Array} groups - Array of groups with balances
 */
export const calculateOverallBalance = (groups) => {
  if (!groups || groups.length === 0) return { youOwe: 0, youAreOwed: 0 };
  
  let totalOwed = 0;
  let totalOwing = 0;

  groups.forEach(group => {
    if (group.balance > 0) {
      totalOwed += group.balance;
    } else if (group.balance < 0) {
      totalOwing += Math.abs(group.balance);
    }
  });

  return {
    youOwe: totalOwing,
    youAreOwed: totalOwed,
  };
};

/**
 * Format expense data from API for frontend display
 * @param {Object} expense - Expense from API
 * @param {Object} currentUser - Current user object
 */
export const formatExpenseForDisplay = (expense, currentUser, groupName = null) => {
  return {
    id: expense.id,
    description: expense.description,
    amount: expense.amount,
    paidBy: expense.paid_by_user_id === currentUser.id ? 'You' : 'Other',
    date: expense.expense_date,
    group: groupName,
    icon: getExpenseIcon(expense.description),
  };
};

/**
 * Get emoji icon based on expense description
 * @param {string} description - Expense description
 */
const getExpenseIcon = (description) => {
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes('dinner') || lowerDesc.includes('restaurant') || lowerDesc.includes('food')) return '🍽️';
  if (lowerDesc.includes('uber') || lowerDesc.includes('taxi') || lowerDesc.includes('transport')) return '🚗';
  if (lowerDesc.includes('grocery') || lowerDesc.includes('groceries')) return '🛒';
  if (lowerDesc.includes('movie') || lowerDesc.includes('cinema')) return '🎬';
  if (lowerDesc.includes('coffee') || lowerDesc.includes('cafe')) return '☕';
  if (lowerDesc.includes('rent')) return '🏠';
  if (lowerDesc.includes('electricity') || lowerDesc.includes('bill') || lowerDesc.includes('utility')) return '💡';
  if (lowerDesc.includes('flight') || lowerDesc.includes('ticket')) return '✈️';
  return '💰';
};

export default api;
