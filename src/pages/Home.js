import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>💰 Investment & Money Tracker</h1>
        <p className="subtitle">Take control of your finances with smart investment tracking and monthly budget planning</p>
        <div className="cta-buttons">
          <Link to="/dashboard" className="btn btn-primary">View Dashboard</Link>
          <Link to="/investments" className="btn btn-primary">Track Investments</Link>
          <Link to="/goal" className="btn btn-primary">View Goal</Link>
        </div>
      </div>
      
      <div className="features-section">
        <h2>Manage Your Finances</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Investment Tracking</h3>
            <p>Monitor your stocks, mutual funds, and other investments in real-time</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💵</div>
            <h3>Monthly Budget</h3>
            <p>Plan and track your monthly income, expenses, and savings goals</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Financial Overview</h3>
            <p>Get a complete picture of your financial health with detailed analytics</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Goal Setting</h3>
            <p>Set and achieve your financial goals with progress tracking</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;


