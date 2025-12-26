import React, { useState, useEffect } from 'react';
import { investmentAPI, goalAPI } from '../services/api';
import './Investments.css';

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [showLinkGoalModal, setShowLinkGoalModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    invested: '',
    current_value: '',
    purchase_date: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    fetchInvestments();
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const data = await goalAPI.getAll();
      setGoals(data || []);
    } catch (err) {
      console.error('Goals error:', err);
    }
  };

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const data = await investmentAPI.getAll();
      setInvestments(data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load investments. Make sure the backend is running.');
      console.error('Investments error:', err);
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
    if (!formData.name || !formData.type || !formData.invested || !formData.current_value) {
      setFormError('Please fill in all required fields');
      return;
    }

    try {
      const investmentData = {
        name: formData.name,
        type: formData.type,
        invested: parseFloat(formData.invested),
        current_value: parseFloat(formData.current_value),
        purchase_date: formData.purchase_date
          ? new Date(formData.purchase_date).toISOString()
          : new Date().toISOString()
      };

      if (editingInvestment) {
        // Update existing investment
        await investmentAPI.update(editingInvestment.id, investmentData);
        setFormSuccess('Investment updated successfully!');
      } else {
        // Create new investment
        await investmentAPI.create(investmentData);
        setFormSuccess('Investment added successfully!');
      }
      
      // Reset form
      setFormData({
        name: '',
        type: '',
        invested: '',
        current_value: '',
        purchase_date: ''
      });
      setEditingInvestment(null);
      
      // Refresh investments list
      fetchInvestments();
      
      // Close form after 2 seconds
      setTimeout(() => {
        setShowForm(false);
        setFormSuccess('');
      }, 2000);
    } catch (err) {
      setFormError(editingInvestment ? 'Failed to update investment. Please try again.' : 'Failed to add investment. Please try again.');
      console.error('Investment operation error:', err);
    }
  };

  const handleEdit = (investment) => {
    setEditingInvestment(investment);
    setFormData({
      name: investment.name,
      type: investment.type,
      invested: investment.invested.toString(),
      current_value: investment.current_value.toString(),
      purchase_date: investment.purchase_date ? new Date(investment.purchase_date).toISOString().split('T')[0] : ''
    });
    setShowForm(true);
    setFormError('');
    setFormSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingInvestment(null);
    setFormData({
      name: '',
      type: '',
      invested: '',
      current_value: '',
      purchase_date: ''
    });
    setShowForm(false);
    setFormError('');
    setFormSuccess('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      try {
        await investmentAPI.delete(id);
        fetchInvestments();
      } catch (err) {
        console.error('Delete error:', err);
        alert('Failed to delete investment');
      }
    }
  };

  const handleLinkGoal = (investment) => {
    setSelectedInvestment(investment);
    setSelectedGoalId(investment.goal_id || '');
    setShowLinkGoalModal(true);
  };

  const handleLinkGoalSubmit = async () => {
    if (!selectedInvestment) return;

    try {
      if (selectedGoalId) {
        await investmentAPI.linkToGoal(selectedInvestment.id, selectedGoalId);
        alert('Investment linked to goal successfully!');
      } else {
        await investmentAPI.unlinkFromGoal(selectedInvestment.id);
        alert('Investment unlinked from goal successfully!');
      }
      setShowLinkGoalModal(false);
      setSelectedInvestment(null);
      setSelectedGoalId('');
      fetchInvestments();
    } catch (err) {
      console.error('Link goal error:', err);
      alert('Failed to link/unlink investment to goal');
    }
  };

  const getGoalName = (goalId) => {
    const goal = goals.find(g => g.id === goalId);
    return goal ? goal.name : 'Unknown Goal';
  };

  const totalInvested = investments.reduce((sum, inv) => sum + (inv.invested || 0), 0);
  const totalCurrent = investments.reduce((sum, inv) => sum + (inv.current_value || 0), 0);
  const totalGain = totalCurrent - totalInvested;
  const totalReturns = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : 0;

  const getReturnClass = (returns) => {
    if (returns >= 10) return 'return-high';
    if (returns >= 0) return 'return-medium';
    return 'return-low';
  };

  if (loading) {
    return (
      <div className="investments-container">
        <div className="loading">Loading investments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="investments-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="investments-container">
      <div className="investments-header">
        <h1>📈 Investment Portfolio</h1>
        <p>Track and manage all your investments in one place</p>
      </div>

      <div className="portfolio-summary">
        <div className="summary-card">
          <h3>Total Invested</h3>
          <p className="summary-amount">₹{totalInvested.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h3>Current Value</h3>
          <p className="summary-amount current">₹{totalCurrent.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h3>Total Gain</h3>
          <p className={`summary-amount ${totalGain >= 0 ? 'gain' : 'loss'}`}>
            {totalGain >= 0 ? '+' : ''}₹{totalGain.toLocaleString()}
          </p>
        </div>
        <div className="summary-card">
          <h3>Overall Returns</h3>
          <p className={`summary-amount ${totalReturns >= 0 ? 'returns' : 'loss'}`}>
            {totalReturns >= 0 ? '+' : ''}{totalReturns}%
          </p>
        </div>
      </div>

      <div className="investments-section">
        <div className="section-header">
          <h2>All Investments</h2>
          <button
            className="add-investment-btn"
            onClick={() => {
              if (showForm && editingInvestment) {
                handleCancelEdit();
              } else {
                setShowForm(!showForm);
                if (!showForm) {
                  setEditingInvestment(null);
                  setFormData({
                    name: '',
                    type: '',
                    invested: '',
                    current_value: '',
                    purchase_date: ''
                  });
                }
              }
            }}
          >
            {showForm ? '✕ Cancel' : '+ Add New Investment'}
          </button>
        </div>

        {showForm && (
          <div className="investment-form-container">
            <h3>{editingInvestment ? 'Edit Investment' : 'Add New Investment'}</h3>
            {formError && <div className="form-error">{formError}</div>}
            {formSuccess && <div className="form-success">{formSuccess}</div>}
            
            <form onSubmit={handleSubmit} className="investment-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Investment Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Nifty 50 Index Fund"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Mutual Fund">Mutual Fund</option>
                    <option value="Stocks">Stocks</option>
                    <option value="ETF">ETF</option>
                    <option value="Fixed Deposit">Fixed Deposit</option>
                    <option value="PPF">PPF</option>
                    <option value="Bonds">Bonds</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Gold">Gold</option>
                    <option value="Crypto">Cryptocurrency</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Amount Invested (₹) *</label>
                  <input
                    type="number"
                    name="invested"
                    value={formData.invested}
                    onChange={handleInputChange}
                    placeholder="50000"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Current Value (₹) *</label>
                  <input
                    type="number"
                    name="current_value"
                    value={formData.current_value}
                    onChange={handleInputChange}
                    placeholder="56000"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Purchase Date</label>
                <input
                  type="date"
                  name="purchase_date"
                  value={formData.purchase_date}
                  onChange={handleInputChange}
                />
              </div>

              <button type="submit" className="submit-btn">
                {editingInvestment ? 'Update Investment' : 'Add Investment'}
              </button>
            </form>
          </div>
        )}

        {investments.length === 0 ? (
          <div className="empty-state">
            <p>No investments found. Start by adding your first investment!</p>
          </div>
        ) : (
          <div className="investments-grid">
            {investments.map(investment => {
              const invested = investment.invested || 0;
              const currentValue = investment.current_value || 0;
              const gain = currentValue - invested;
              const returns = invested > 0 ? ((gain / invested) * 100).toFixed(2) : 0;
              
              return (
                <div key={investment.id} className="investment-card">
                  <div className="investment-header-card">
                    <h3>{investment.name}</h3>
                    <span className="investment-type">{investment.type}</span>
                  </div>
                  <div className="investment-details">
                    <div className="detail-row">
                      <span className="detail-label">Invested:</span>
                      <span className="detail-value">₹{invested.toLocaleString()}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Current Value:</span>
                      <span className="detail-value current">₹{currentValue.toLocaleString()}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Gain/Loss:</span>
                      <span className={`detail-value ${gain >= 0 ? 'gain' : 'loss'}`}>
                        {gain >= 0 ? '+' : ''}₹{gain.toLocaleString()}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Returns:</span>
                      <span className={`detail-value ${getReturnClass(returns)}`}>
                        {returns >= 0 ? '+' : ''}{returns}%
                      </span>
                    </div>
                    {investment.purchase_date && (
                      <div className="detail-row">
                        <span className="detail-label">Date:</span>
                        <span className="detail-value">
                          {new Date(investment.purchase_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {investment.goal_id && (
                      <div className="detail-row">
                        <span className="detail-label">Linked Goal:</span>
                        <span className="detail-value goal-link">
                          🎯 {getGoalName(investment.goal_id)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="investment-actions">
                    <button
                      className="action-btn view-btn"
                      onClick={() => handleEdit(investment)}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn link-btn"
                      onClick={() => handleLinkGoal(investment)}
                    >
                      {investment.goal_id ? '🔗 Change Goal' : '🔗 Link Goal'}
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(investment.id)}
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

      <div className="investment-tips">
        <h2>💡 Investment Tips</h2>
        <div className="tips-grid">
          <div className="tip-card">
            <h4>Diversify Your Portfolio</h4>
            <p>Don't put all your eggs in one basket. Spread investments across different asset classes.</p>
          </div>
          <div className="tip-card">
            <h4>Long-term Perspective</h4>
            <p>Stay invested for the long term to ride out market volatility and maximize returns.</p>
          </div>
          <div className="tip-card">
            <h4>Regular Monitoring</h4>
            <p>Review your portfolio regularly but avoid making impulsive decisions based on short-term fluctuations.</p>
          </div>
        </div>
      </div>

      {/* Link Goal Modal */}
      {showLinkGoalModal && (
        <div className="modal-overlay" onClick={() => setShowLinkGoalModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Link Investment to Goal</h3>
            <p>Select a goal to link this investment to, or select "None" to unlink.</p>
            
            <div className="form-group">
              <label>Select Goal</label>
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="goal-select"
              >
                <option value="">-- None (Unlink) --</option>
                {goals.map(goal => (
                  <option key={goal.id} value={goal.id}>
                    {goal.name} (₹{goal.target_amount.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button
                className="modal-btn cancel-btn"
                onClick={() => setShowLinkGoalModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal-btn submit-btn"
                onClick={handleLinkGoalSubmit}
              >
                {selectedGoalId ? 'Link to Goal' : 'Unlink from Goal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Investments;


