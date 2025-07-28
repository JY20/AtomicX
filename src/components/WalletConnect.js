import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { connect } from 'get-starknet';
import './WalletConnect.css';

const WalletConnect = ({ selectedNetwork }) => {
  const [ethAccount, setEthAccount] = useState(null);
  const [starknetAccount, setStarknetAccount] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [activeWallet, setActiveWallet] = useState(null); // 'ethereum' or 'starknet'
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Check if wallets are already connected
    const checkConnectedWallets = async () => {
      // Check Ethereum wallet
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setEthAccount(accounts[0]);
          setActiveWallet('ethereum');
        }
      }

      // Check Starknet wallet
      try {
        const starknet = await connect();
        if (starknet && starknet.isConnected) {
          setStarknetAccount(starknet.account);
          setActiveWallet('starknet');
        }
      } catch (error) {
        console.error("Error checking Starknet connection:", error);
      }
    };

    checkConnectedWallets();
  }, []);

  // Effect to handle network changes
  useEffect(() => {
    if (selectedNetwork && activeWallet) {
      const isEthereumNetwork = selectedNetwork.id.startsWith('eth-');
      const isStarknetNetwork = selectedNetwork.id.startsWith('starknet-');
      
      // If network type doesn't match active wallet type, disconnect
      if ((isEthereumNetwork && activeWallet !== 'ethereum') || 
          (isStarknetNetwork && activeWallet !== 'starknet')) {
        disconnectWallet();
      } else {
        // Here you would switch the network in the wallet if needed
        console.log(`Switching to ${selectedNetwork.name} ${selectedNetwork.type}`);
        
        if (isEthereumNetwork && window.ethereum) {
          switchEthereumChain(selectedNetwork.chainId);
        }
        // For Starknet, the wallet typically handles network switching
      }
    }
  }, [selectedNetwork, activeWallet]);

  const switchEthereumChain = async (chainId) => {
    if (!window.ethereum) return;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (error) {
      console.error('Error switching Ethereum chain:', error);
    }
  };

  const connectEthereumWallet = async () => {
    if (window.ethereum) {
      try {
        setConnecting(true);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setEthAccount(accounts[0]);
        setActiveWallet('ethereum');
        setShowDropdown(false);
        
        // Switch to selected network if it's an Ethereum network
        if (selectedNetwork && selectedNetwork.id.startsWith('eth-')) {
          await switchEthereumChain(selectedNetwork.chainId);
        }
      } catch (error) {
        console.error("Error connecting to Ethereum wallet:", error);
      } finally {
        setConnecting(false);
      }
    } else {
      alert("Please install MetaMask or another Ethereum wallet");
    }
  };

  const connectStarknetWallet = async () => {
    try {
      setConnecting(true);
      const starknet = await connect();
      if (!starknet) {
        alert("Please install a Starknet wallet like ArgentX");
        return;
      }
      
      await starknet.enable();
      setStarknetAccount(starknet.account);
      setActiveWallet('starknet');
      setShowDropdown(false);
    } catch (error) {
      console.error("Error connecting to Starknet wallet:", error);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setEthAccount(null);
    setStarknetAccount(null);
    setActiveWallet(null);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleConnectClick = () => {
    if (selectedNetwork) {
      const isEthNetwork = selectedNetwork.id.startsWith('eth-');
      if (isEthNetwork) {
        connectEthereumWallet();
      } else {
        connectStarknetWallet();
      }
    } else {
      // If no network is selected, show a message
      alert("Please select a network first");
    }
  };

  return (
    <div className="wallet-connect-container">
      {!activeWallet ? (
        <button 
          className="connect-wallet-button"
          onClick={handleConnectClick}
          disabled={connecting || !selectedNetwork}
        >
          {connecting ? (
            <div className="loading-spinner"></div>
          ) : (
            <span>
              {selectedNetwork ? `Connect to ${selectedNetwork.name}` : 'Select Network'}
            </span>
          )}
        </button>
      ) : (
        <div className="wallet-info">
          <div 
            className="wallet-icon" 
            style={{
              backgroundColor: activeWallet === 'ethereum' ? '#627eea' : '#ff4a60'
            }}
          >
            {activeWallet === 'ethereum' ? 'ETH' : 'STRK'}
          </div>
          <div className="wallet-details">
            <span className="wallet-address">
              {activeWallet === 'ethereum' 
                ? formatAddress(ethAccount)
                : formatAddress(starknetAccount?.address)}
            </span>
            <span className="wallet-network">
              {selectedNetwork ? `${selectedNetwork.name} ${selectedNetwork.type}` : ''}
            </span>
          </div>
          <button className="disconnect-button" onClick={disconnectWallet}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6" stroke="#FF4A60" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10.6667 11.3333L14.0001 8L10.6667 4.66667" stroke="#FF4A60" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 8H6" stroke="#FF4A60" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect; 