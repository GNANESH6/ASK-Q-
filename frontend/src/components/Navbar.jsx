import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">ASK-Q</Link>
      <div className="nav-links">
        <Link 
          to="/create-post" 
          className={`nav-link ${location.pathname === '/create-post' ? 'active' : ''}`}
        >
          Create Post
        </Link>
        <Link 
          to="/" 
          className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
        >
          View Posts
        </Link>
        <Link 
          to="/profile" 
          className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
        >
          Profile
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
