import React from 'react';
import './Navbar.css';
import WalletConnect from './WalletConnect';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <span>AtomicX</span>
        </div>
        <ul className="nav-menu">
          <li className="nav-item">
            <a href="#home" className="nav-link">Home</a>
          </li>
          <li className="nav-item">
            <a href="#features" className="nav-link">Features</a>
          </li>
          <li className="nav-item">
            <a href="#how-it-works" className="nav-link">How It Works</a>
          </li>
          <li className="nav-item">
            <a href="#about" className="nav-link">About</a>
          </li>
        </ul>
        <div className="nav-actions">
          <WalletConnect />
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 