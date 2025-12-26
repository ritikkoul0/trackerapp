import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>About Money Tracker</h1>
        <p className="tagline">Empowering financial freedom through smart money management</p>
      </div>

      <div className="about-content">
        <section className="mission-section">
          <h2>Our Mission</h2>
          <p>
            At Money Tracker, we believe that financial awareness is the foundation of wealth building.
            Our mission is to provide individuals with powerful yet simple tools to track investments,
            manage monthly budgets, and achieve their financial goals through data-driven insights.
          </p>
        </section>

        <section className="story-section">
          <h2>Why We Built This</h2>
          <p>
            Managing personal finances shouldn't be complicated. We created this app to help you
            track your investments across stocks, mutual funds, and other assets, while also
            planning your monthly income and expenses. Built with modern React technology,
            it provides a fast, intuitive experience for managing your financial life.
          </p>
        </section>

        <section className="values-section">
          <h2>Key Features</h2>
          <div className="values-grid">
            <div className="value-item">
              <h3>📈 Investment Tracking</h3>
              <p>Monitor all your investments in one place with real-time updates</p>
            </div>
            <div className="value-item">
              <h3>💰 Budget Planning</h3>
              <p>Plan and track monthly income, expenses, and savings goals</p>
            </div>
            <div className="value-item">
              <h3>📊 Financial Analytics</h3>
              <p>Get insights into your financial health with detailed reports</p>
            </div>
            <div className="value-item">
              <h3>🎯 Goal Setting</h3>
              <p>Set financial goals and track your progress towards them</p>
            </div>
          </div>
        </section>

        <section className="team-section">
          <h2>Built with Modern Technology</h2>
          <div className="tech-stack">
            <div className="tech-item">React</div>
            <div className="tech-item">React Router</div>
            <div className="tech-item">Modern CSS</div>
            <div className="tech-item">Responsive Design</div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;


