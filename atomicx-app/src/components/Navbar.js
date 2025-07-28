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
        <div className="nav-actions">
          <WalletConnect />
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 