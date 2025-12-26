import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    closeMenu();
    logout();
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/dashboard" className="nav-logo" onClick={closeMenu}>
          💰 Money Tracker
        </Link>
        
        <div className="menu-icon" onClick={toggleMenu}>
          <span className={isMenuOpen ? 'menu-icon-active' : ''}>☰</span>
        </div>

        <ul className={isMenuOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link
              to="/dashboard"
              className={`nav-link ${isActive('/dashboard')}`}
              onClick={closeMenu}
            >
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/investments"
              className={`nav-link ${isActive('/investments')}`}
              onClick={closeMenu}
            >
              Investments
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/goal"
              className={`nav-link ${isActive('/goal')}`}
              onClick={closeMenu}
            >
              Goals
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/about"
              className={`nav-link ${isActive('/about')}`}
              onClick={closeMenu}
            >
              About
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/contact"
              className={`nav-link ${isActive('/contact')}`}
              onClick={closeMenu}
            >
              Contact
            </Link>
          </li>
          
          {user && (
            <>
              <li className="nav-item user-info">
                <span className="user-email">{user.email}</span>
              </li>
              <li className="nav-item">
                <button className="nav-link logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;


