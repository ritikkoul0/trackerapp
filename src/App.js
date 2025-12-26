import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Investments from './pages/Investments';
import About from './pages/About';
import Goal from './pages/Goal';
import Contact from './pages/Contact';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Public route - Login */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes - require authentication */}
            <Route path="/*" element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <main className="main-content">
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/investments" element={<Investments />} />
                      <Route path="/goal" element={<Goal />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/home" element={<Home />} />
                    </Routes>
                  </main>
                  <footer className="footer">
                    <div className="footer-content">
                      <p>&copy; 2026 Investment & Money Tracker. All rights reserved.</p>
                      <div className="footer-links">
                        <a href="#privacy">Privacy Policy</a>
                        <a href="#terms">Terms of Service</a>
                        <a href="#support">Support</a>
                      </div>
                    </div>
                  </footer>
                </>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;


