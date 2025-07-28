import React, { useState } from 'react';
import './Navbar.css';
import WalletConnect from './WalletConnect';
import NetworkSelector from './NetworkSelector';

function Navbar() {
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  
  const handleNetworkChange = (network) => {
    console.log('Network changed:', network);
    setSelectedNetwork(network);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <span>AtomicX</span>
        </div>
        <div className="nav-actions">
          <NetworkSelector onNetworkChange={handleNetworkChange} />
          <WalletConnect selectedNetwork={selectedNetwork} />
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 