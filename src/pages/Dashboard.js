import React, { useState, useEffect } from 'react';
import { dashboardAPI, userAPI } from '../services/api';
import './Dashboard.css';

// Utility function to format numbers in Indian system (Lakhs/Crores)
const formatIndianCurrency = (num) => {
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  } else if (num >= 1000) {
    return `₹${(num / 1000).toFixed(2)} K`;
  }
  return `₹${num.toLocaleString()}`;
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    monthly_income: 0,
    monthly_expenses: 0,
    monthly_savings: 0,
    total_investments: 0,
    total_gains: 0,
    investments: [],
    goals: [],
    recent_expenses: []
  });
  const [editMode, setEditMode] = useState({
    income: false,
    expenses: false,
    savings: false
  });
  const [editValues, setEditValues] = useState({
    income: 0,
    expenses: 0,
    savings: 0
  });

  useEffect(() => {
    fetchDashboardData();
    fetchUserFinancials();
  }, []);

  const fetchUserFinancials = async () => {
    try {
      const userData = await userAPI.getFinancials();
      setUserId(userData.id);
      setDashboardData(prev => ({
        ...prev,
        monthly_income: userData.monthly_income || 0,
        monthly_expenses: userData.monthly_expenses || 0,
        monthly_savings: userData.monthly_savings || 0
      }));
      setEditValues({
        income: userData.monthly_income || 0,
        expenses: userData.monthly_expenses || 0,
        savings: userData.monthly_savings || 0
      });
    } catch (err) {
      console.error('Failed to fetch user financials:', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardAPI.getSummary();
      setDashboardData(prev => ({
        ...prev,
        total_investments: data.total_investments || 0,
        total_gains: data.total_gains || 0,
        investments: data.investments || [],
        goals: data.goals || [],
        recent_expenses: data.recent_expenses || []
      }));
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data. Make sure the backend is running.');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field) => {
    setEditMode({ ...editMode, [field]: true });
  };

  const handleCancel = (field) => {
    setEditMode({ ...editMode, [field]: false });
    setEditValues({
      ...editValues,
      [field]: dashboardData[`monthly_${field}`] || 0
    });
  };

  const handleSave = async (field) => {
    const value = parseFloat(editValues[field]) || 0;
    
    try {
      // Save to backend
      if (userId) {
        const updateData = {};
        if (field === 'income') updateData.monthly_income = value;
        if (field === 'expenses') updateData.monthly_expenses = value;
        if (field === 'savings') updateData.monthly_savings = value;
        
        await userAPI.updateFinancials(userId, updateData);
      }
      
      // Update local state
      setDashboardData({
        ...dashboardData,
        [`monthly_${field}`]: value
      });
      setEditMode({ ...editMode, [field]: false });
    } catch (err) {
      console.error('Failed to save:', err);
      alert('Failed to save changes. Please try again.');
    }
  };

  const handleInputChange = (field, value) => {
    setEditValues({ ...editValues, [field]: value });
  };

  const totalInvestment = dashboardData.total_investments || 0;
  const savingsGoal = 35000; // You can make this dynamic later
  const savingsPercentage = dashboardData.monthly_savings > 0
    ? (dashboardData.monthly_savings / savingsGoal) * 100
    : 0;

  const getStatusClass = (status) => {
    switch(status) {
      case 'Growing': return 'status-growing';
      case 'Stable': return 'status-stable';
      case 'Declining': return 'status-declining';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>💰 Financial Dashboard</h1>
        <p>Your complete financial overview for this month</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-income">
          <div className="stat-icon">💵</div>
          <div className="stat-info">
            <h3>Monthly Income</h3>
            {editMode.income ? (
              <div className="edit-mode">
                <input
                  type="number"
                  value={editValues.income}
                  onChange={(e) => handleInputChange('income', e.target.value)}
                  className="edit-input"
                />
                <div className="edit-buttons">
                  <button onClick={() => handleSave('income')} className="save-btn">✓</button>
                  <button onClick={() => handleCancel('income')} className="cancel-btn">✕</button>
                </div>
              </div>
            ) : (
              <div className="view-mode">
                <p className="stat-number">{formatIndianCurrency(dashboardData.monthly_income)}</p>
                <button onClick={() => handleEdit('income')} className="edit-btn">✎</button>
              </div>
            )}
          </div>
        </div>
        <div className="stat-card stat-expenses">
          <div className="stat-icon">💳</div>
          <div className="stat-info">
            <h3>Expenses</h3>
            {editMode.expenses ? (
              <div className="edit-mode">
                <input
                  type="number"
                  value={editValues.expenses}
                  onChange={(e) => handleInputChange('expenses', e.target.value)}
                  className="edit-input"
                />
                <div className="edit-buttons">
                  <button onClick={() => handleSave('expenses')} className="save-btn">✓</button>
                  <button onClick={() => handleCancel('expenses')} className="cancel-btn">✕</button>
                </div>
              </div>
            ) : (
              <div className="view-mode">
                <p className="stat-number">{formatIndianCurrency(dashboardData.monthly_expenses)}</p>
                <button onClick={() => handleEdit('expenses')} className="edit-btn">✎</button>
              </div>
            )}
          </div>
        </div>
        <div className="stat-card stat-savings">
          <div className="stat-icon">🏦</div>
          <div className="stat-info">
            <h3>Savings</h3>
            {editMode.savings ? (
              <div className="edit-mode">
                <input
                  type="number"
                  value={editValues.savings}
                  onChange={(e) => handleInputChange('savings', e.target.value)}
                  className="edit-input"
                />
                <div className="edit-buttons">
                  <button onClick={() => handleSave('savings')} className="save-btn">✓</button>
                  <button onClick={() => handleCancel('savings')} className="cancel-btn">✕</button>
                </div>
              </div>
            ) : (
              <div className="view-mode">
                <p className="stat-number">{formatIndianCurrency(dashboardData.monthly_savings)}</p>
                <button onClick={() => handleEdit('savings')} className="edit-btn">✎</button>
              </div>
            )}
          </div>
        </div>
        <div className="stat-card stat-investments">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <h3>Total Investments</h3>
            <p className="stat-number">{formatIndianCurrency(totalInvestment)}</p>
          </div>
        </div>
      </div>

      <div className="tasks-section">
        <div className="section-header">
          <h2>Investment Portfolio</h2>
        </div>
        
        <div className="tasks-table">
          {dashboardData.investments && dashboardData.investments.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Investment Name</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Returns</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.investments.map(investment => (
                  <tr key={investment.id}>
                    <td className="task-title">{investment.name}</td>
                    <td>{investment.type}</td>
                    <td className="amount">₹{investment.current_value?.toLocaleString() || 0}</td>
                    <td className="returns">+{investment.returns?.toFixed(2) || 0}%</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(investment.status)}`}>
                        {investment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No investments found. Add your first investment!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


