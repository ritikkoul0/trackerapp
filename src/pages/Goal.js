import React, { useState, useEffect } from 'react';
import { goalAPI, investmentAPI } from '../services/api';
import './Goal.css';

const Goal = () => {
  const [goals, setGoals] = useState([]);
  const [linkedInvestments, setLinkedInvestments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showInvestmentsModal, setShowInvestmentsModal] = useState(false);
  const [selectedGoalInvestments, setSelectedGoalInvestments] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '',
    deadline: '',
    status: 'Planned'
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  useEffect(() => {
    if (goals.length > 0) {
      fetchLinkedInvestments();
    }
  }, [goals]);

  const fetchLinkedInvestments = async () => {
    const investmentsMap = {};
    for (const goal of goals) {
      try {
        const data = await investmentAPI.getByGoal(goal.id);
        investmentsMap[goal.id] = data;
      } catch (err) {
        console.error(`Error fetching investments for goal ${goal.id}:`, err);
        investmentsMap[goal.id] = { investments: [], total: 0, count: 0 };
      }
    }
    setLinkedInvestments(investmentsMap);
  };

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const data = await goalAPI.getAll();
      setGoals(data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load goals. Make sure the backend is running.');
      console.error('Goals error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Validation
    if (!formData.name || !formData.target_amount) {
      setFormError('Please fill in all required fields');
      return;
    }

    try {
      const goalData = {
        name: formData.name,
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount) || 0,
        deadline: formData.deadline
          ? new Date(formData.deadline).toISOString()
          : new Date().toISOString(),
        status: formData.status
      };

      if (editingGoal) {
        // Update existing goal
        await goalAPI.update(editingGoal.id, goalData);
        setFormSuccess('Goal updated successfully!');
      } else {
        // Create new goal
        await goalAPI.create(goalData);
        setFormSuccess('Goal added successfully!');
      }
      
      // Reset form
      setFormData({
        name: '',
        target_amount: '',
        current_amount: '',
        deadline: '',
        status: 'Planned'
      });
      setEditingGoal(null);
      
      // Refresh goals list
      fetchGoals();
      
      // Close form after 2 seconds
      setTimeout(() => {
        setShowForm(false);
        setFormSuccess('');
      }, 2000);
    } catch (err) {
      setFormError(editingGoal ? 'Failed to update goal. Please try again.' : 'Failed to add goal. Please try again.');
      console.error('Goal operation error:', err);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount.toString(),
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
      status: goal.status
    });
    setShowForm(true);
    setFormError('');
    setFormSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingGoal(null);
    setFormData({
      name: '',
      target_amount: '',
      current_amount: '',
      deadline: '',
      status: 'Planned'
    });
    setShowForm(false);
    setFormError('');
    setFormSuccess('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await goalAPI.delete(id);
        fetchGoals();
      } catch (err) {
        console.error('Delete error:', err);
        alert('Failed to delete goal');
      }
    }
  };

  const handleViewInvestments = (goalId) => {
    const investments = linkedInvestments[goalId];
    if (investments && investments.investments.length > 0) {
      setSelectedGoalInvestments(investments);
      setShowInvestmentsModal(true);
    } else {
      alert('No investments linked to this goal yet.');
    }
  };

  const totalTargetAmount = goals.reduce((sum, goal) => sum + (goal.target_amount || 0), 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + (goal.current_amount || 0), 0);
  const savingsPercentage = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  const getStatusClass = (status) => {
    switch(status) {
      case 'Planned': return 'status-planned';
      case 'In Progress': return 'status-in-progress';
      case 'Completed': return 'status-completed';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="goal-container">
        <div className="loading">Loading goals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="goal-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="goal-container">
      <div className="goal-header">
        <h1>🎯 Goal Dashboard</h1>
        <p>Your complete financial goals overview</p>
      </div>

      <div className="tasks-section">
        <div className="section-header">
          <h2>Goals Portfolio</h2>
          <button
            className="add-task-btn"
            onClick={() => {
              if (showForm && editingGoal) {
                handleCancelEdit();
              } else {
                setShowForm(!showForm);
                if (!showForm) {
                  setEditingGoal(null);
                  setFormData({
                    name: '',
                    target_amount: '',
                    current_amount: '',
                    deadline: '',
                    status: 'Planned'
                  });
                }
              }
            }}
          >
            {showForm ? '✕ Cancel' : '+ Add Goal'}
          </button>
        </div>

        {showForm && (
          <div className="goal-form-container">
            <h3>{editingGoal ? 'Edit Goal' : 'Add New Goal'}</h3>
            {formError && <div className="form-error">{formError}</div>}
            {formSuccess && <div className="form-success">{formSuccess}</div>}
            
            <form onSubmit={handleSubmit} className="goal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Goal Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Emergency Fund"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Target Amount (₹) *</label>
                  <input
                    type="number"
                    name="target_amount"
                    value={formData.target_amount}
                    onChange={handleInputChange}
                    placeholder="100000"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Current Amount (₹)</label>
                  <input
                    type="number"
                    name="current_amount"
                    value={formData.current_amount}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                />
              </div>

              <button type="submit" className="submit-btn">
                {editingGoal ? 'Update Goal' : 'Add Goal'}
              </button>
            </form>
          </div>
        )}
        
        {goals.length === 0 ? (
          <div className="empty-state">
            <p>No goals found. Start by adding your first financial goal!</p>
          </div>
        ) : (
          <div className="goals-grid">
            {goals.map(goal => {
              const targetAmount = goal.target_amount || 0;
              const currentAmount = goal.current_amount || 0;
              const progress = targetAmount > 0 ? ((currentAmount / targetAmount) * 100).toFixed(1) : 0;
              
              return (
                <div key={goal.id} className="goal-card">
                  <div className="goal-header-card">
                    <h3>{goal.name}</h3>
                    <span className={`status-badge ${getStatusClass(goal.status)}`}>
                      {goal.status}
                    </span>
                  </div>
                  <div className="goal-details">
                    <div className="detail-row">
                      <span className="detail-label">Target Amount:</span>
                      <span className="detail-value">₹{targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Current Amount:</span>
                      <span className="detail-value current">₹{currentAmount.toLocaleString()}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Progress:</span>
                      <span className={`detail-value ${progress >= 100 ? 'completed' : progress >= 50 ? 'in-progress' : 'planned'}`}>
                        {progress}%
                      </span>
                    </div>
                    {goal.deadline && (
                      <div className="detail-row">
                        <span className="detail-label">Deadline:</span>
                        <span className="detail-value">
                          {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {linkedInvestments[goal.id] && linkedInvestments[goal.id].count > 0 && (
                      <div className="detail-row">
                        <span className="detail-label">Linked Investments:</span>
                        <span className="detail-value investment-count">
                          {linkedInvestments[goal.id].count} investment{linkedInvestments[goal.id].count !== 1 ? 's' : ''}
                          (₹{linkedInvestments[goal.id].total.toLocaleString()})
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="goal-progress-bar">
                    <div
                      className="goal-progress-fill"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="goal-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEdit(goal)}
                    >
                      Edit
                    </button>
                    {linkedInvestments[goal.id] && linkedInvestments[goal.id].count > 0 && (
                      <button
                        className="action-btn view-investments-btn"
                        onClick={() => handleViewInvestments(goal.id)}
                      >
                        View Investments
                      </button>
                    )}
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(goal.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="progress-section">
        <h2>Overall Goals Progress</h2>
        <div className="progress-bar-container">
          <div
            className="progress-bar"
            style={{ width: `${Math.min(savingsPercentage, 100)}%` }}
          >
            <span className="progress-text">
              {Math.round(savingsPercentage)}%
            </span>
          </div>
        </div>
        <p className="progress-info">
          ₹{totalCurrentAmount.toLocaleString()} of ₹{totalTargetAmount.toLocaleString()} achieved
        </p>
      </div>

      {/* Linked Investments Modal */}
      {showInvestmentsModal && selectedGoalInvestments && (
        <div className="modal-overlay" onClick={() => setShowInvestmentsModal(false)}>
          <div className="modal-content investments-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Linked Investments</h3>
            <p className="modal-subtitle">
              Total: ₹{selectedGoalInvestments.total.toLocaleString()}
              ({selectedGoalInvestments.count} investment{selectedGoalInvestments.count !== 1 ? 's' : ''})
            </p>
            
            <div className="investments-list">
              {selectedGoalInvestments.investments.map(investment => {
                const gain = investment.current_value - investment.invested;
                const returns = investment.invested > 0
                  ? ((gain / investment.invested) * 100).toFixed(2)
                  : 0;
                
                return (
                  <div key={investment.id} className="investment-item">
                    <div className="investment-item-header">
                      <h4>{investment.name}</h4>
                      <span className="investment-type-badge">{investment.type}</span>
                    </div>
                    <div className="investment-item-details">
                      <div className="detail-row">
                        <span>Invested:</span>
                        <span>₹{investment.invested.toLocaleString()}</span>
                      </div>
                      <div className="detail-row">
                        <span>Current Value:</span>
                        <span className="current-value">₹{investment.current_value.toLocaleString()}</span>
                      </div>
                      <div className="detail-row">
                        <span>Returns:</span>
                        <span className={returns >= 0 ? 'positive-return' : 'negative-return'}>
                          {returns >= 0 ? '+' : ''}{returns}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="modal-actions">
              <button
                className="modal-btn close-btn"
                onClick={() => setShowInvestmentsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goal;

