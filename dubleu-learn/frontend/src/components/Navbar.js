import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">
          DubleuLearn
        </Link>
      </div>

      <div className="navbar-menu">
        {user ? (
          <>
            <Link 
              to="/" 
              className={`navbar-item ${location.pathname === '/' ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/courses" 
              className={`navbar-item ${location.pathname === '/courses' ? 'active' : ''}`}
            >
              Courses
            </Link>
            
            {/* Teacher/Admin Quick Access Links */}
            {(user.role === 'teacher' || user.role === 'admin') && (
              <>
                <Link 
                  to="/create-course" 
                  className={`navbar-item ${location.pathname === '/create-course' ? 'active' : ''}`}
                >
                  Create Course
                </Link>
              </>
            )}

            <div className="navbar-user">
              <span className="user-name">
                {user.profile.firstName} {user.profile.lastName}
              </span>
              <span className="user-role">({user.role})</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="navbar-auth">
            <Link to="/login" className="navbar-item">Login</Link>
            <Link to="/register" className="navbar-item">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;