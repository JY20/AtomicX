import React, { useState, useEffect, useRef } from 'react';
import './NetworkSelector.css';

const networks = [
  // Ethereum networks
  {
    id: 'eth-mainnet',
    name: 'Ethereum',
    type: 'Mainnet',
    chainId: '0x1',
    icon: 'ETH',
    color: '#627eea',
    chain: 'ethereum'
  },
  {
    id: 'eth-sepolia',
    name: 'Sepolia',
    type: 'Testnet',
    chainId: '0xaa36a7',
    icon: 'ETH',
    color: '#627eea',
    chain: 'ethereum'
  },
  // Starknet networks
  {
    id: 'starknet-mainnet',
    name: 'Starknet',
    type: 'Mainnet',
    chainId: 'SN_MAIN',
    icon: 'STRK',
    color: '#ff4a60',
    chain: 'starknet'
  },
  {
    id: 'starknet-testnet',
    name: 'Starknet',
    type: 'Testnet',
    chainId: 'SN_GOERLI',
    icon: 'STRK',
    color: '#ff4a60',
    chain: 'starknet'
  }
];

const NetworkSelector = ({ onNetworkChange }) => {
  const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeChain, setActiveChain] = useState('ethereum'); // 'ethereum' or 'starknet'
  const selectorRef = useRef(null);

  // Group networks by chain
  const groupedNetworks = {
    ethereum: networks.filter(network => network.chain === 'ethereum'),
    starknet: networks.filter(network => network.chain === 'starknet')
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNetworkSelect = (network) => {
    setSelectedNetwork(network);
    setActiveChain(network.chain);
    setIsOpen(false);
    if (onNetworkChange) {
      onNetworkChange(network);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleChainSelect = (chain) => {
    setActiveChain(chain);
    // Select the first network of the selected chain
    const firstNetworkOfChain = groupedNetworks[chain][0];
    handleNetworkSelect(firstNetworkOfChain);
  };

  return (
    <div className="network-selector-container" ref={selectorRef}>
      <button 
        className="network-selector-button"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="selected-network">
          <div 
            className="network-icon" 
            style={{backgroundColor: selectedNetwork.color}}
          >
            {selectedNetwork.icon}
          </div>
          <div className="network-info">
            <span className="network-name">{selectedNetwork.name}</span>
            <span className="network-type">{selectedNetwork.type}</span>
          </div>
        </div>
        <div className={`arrow-icon ${isOpen ? 'open' : ''}`}>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L5 5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="network-dropdown">
          <div className="chain-selector">
            <button 
              className={`chain-option ${activeChain === 'ethereum' ? 'active' : ''}`}
              onClick={() => handleChainSelect('ethereum')}
            >
              <div className="chain-icon ethereum">ETH</div>
              <span>Ethereum</span>
            </button>
            <button 
              className={`chain-option ${activeChain === 'starknet' ? 'active' : ''}`}
              onClick={() => handleChainSelect('starknet')}
            >
              <div className="chain-icon starknet">STRK</div>
              <span>Starknet</span>
            </button>
          </div>
          
          <div className="divider"></div>
          
          <div className="networks-list" role="listbox">
            {groupedNetworks[activeChain].map(network => (
              <div 
                key={network.id}
                className={`network-option ${selectedNetwork.id === network.id ? 'selected' : ''}`}
                onClick={() => handleNetworkSelect(network)}
                role="option"
                aria-selected={selectedNetwork.id === network.id}
              >
                <div 
                  className="network-icon" 
                  style={{backgroundColor: network.color}}
                >
                  {network.icon}
                </div>
                <div className="network-details">
                  <span className="network-name">{network.name}</span>
                  <span className="network-type">{network.type}</span>
                </div>
                {selectedNetwork.id === network.id && (
                  <div className="selected-indicator">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.3334 4L6.00002 11.3333L2.66669 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkSelector; 