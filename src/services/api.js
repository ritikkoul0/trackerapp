const API_BASE_URL = 'http://localhost:8080/api/v1';

// Generic API call function
const apiCall = async (endpoint, method = 'GET', data = null) => {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for authentication
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Authentication required');
      }
      
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Investment API calls
export const investmentAPI = {
  getAll: () => apiCall('/investments'),
  getOne: (id) => apiCall(`/investments/${id}`),
  create: (data) => apiCall('/investments', 'POST', data),
  update: (id, data) => apiCall(`/investments/${id}`, 'PUT', data),
  delete: (id) => apiCall(`/investments/${id}`, 'DELETE'),
  linkToGoal: (id, goalId) => apiCall(`/investments/${id}/link-goal`, 'POST', { goal_id: goalId }),
  unlinkFromGoal: (id) => apiCall(`/investments/${id}/unlink-goal`, 'POST'),
  getByGoal: (goalId) => apiCall(`/investments/by-goal/${goalId}`),
};

// Goal API calls
export const goalAPI = {
  getAll: () => apiCall('/goals'),
  getOne: (id) => apiCall(`/goals/${id}`),
  create: (data) => apiCall('/goals', 'POST', data),
  update: (id, data) => apiCall(`/goals/${id}`, 'PUT', data),
  delete: (id) => apiCall(`/goals/${id}`, 'DELETE'),
};

// Budget API calls
export const budgetAPI = {
  getAll: () => apiCall('/budgets'),
  getOne: (id) => apiCall(`/budgets/${id}`),
  create: (data) => apiCall('/budgets', 'POST', data),
  update: (id, data) => apiCall(`/budgets/${id}`, 'PUT', data),
  delete: (id) => apiCall(`/budgets/${id}`, 'DELETE'),
};

// Expense API calls
export const expenseAPI = {
  getAll: () => apiCall('/expenses'),
  getOne: (id) => apiCall(`/expenses/${id}`),
  create: (data) => apiCall('/expenses', 'POST', data),
  update: (id, data) => apiCall(`/expenses/${id}`, 'PUT', data),
  delete: (id) => apiCall(`/expenses/${id}`, 'DELETE'),
};

// User API calls
export const userAPI = {
  getFinancials: () => apiCall('/users/financials'),
  updateFinancials: (id, data) => apiCall(`/users/${id}/financials`, 'PUT', data),
};

// Dashboard API call
export const dashboardAPI = {
  getSummary: () => apiCall('/dashboard'),
};

// Health check
export const healthCheck = () => apiCall('/health');


