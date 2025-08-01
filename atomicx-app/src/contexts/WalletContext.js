import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { connect } from 'get-starknet';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [ethAccount, setEthAccount] = useState(null);
  const [starknetAccount, setStarknetAccount] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [showEthDropdown, setShowEthDropdown] = useState(false);
  const [showStarknetDropdown, setShowStarknetDropdown] = useState(false);

  useEffect(() => {
    // Check if wallets are already connected
    const checkConnectedWallets = async () => {
      // Check Ethereum wallet
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setEthAccount(accounts[0]);
        }
      }

      // Check Starknet wallet
      try {
        const starknet = await connect();
        if (starknet && starknet.isConnected) {
          setStarknetAccount(starknet.account);
        }
      } catch (error) {
        console.error("Error checking Starknet connection:", error);
      }
    };

    checkConnectedWallets();
  }, []);

  const connectEthWallet = async () => {
    if (window.ethereum) {
      try {
        setConnecting(true);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Request account access
        const accounts = await provider.send("eth_requestAccounts", []);
        
        // Get the network
        const network = await provider.getNetwork();
        console.log('Connected to Ethereum network:', network.name, 'Chain ID:', network.chainId);
        
        // Check if we're on Sepolia testnet (chain ID 11155111)
        if (network.chainId !== 11155111) {
          try {
            // Try to switch to Sepolia
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xaa36a7' }], // 0xaa36a7 is hex for 11155111 (Sepolia)
            });
          } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: '0xaa36a7',
                      chainName: 'Sepolia Testnet',
                      nativeCurrency: {
                        name: 'Sepolia ETH',
                        symbol: 'ETH',
                        decimals: 18
                      },
                      rpcUrls: ['https://sepolia.infura.io/v3/'],
                      blockExplorerUrls: ['https://sepolia.etherscan.io']
                    }
                  ],
                });
              } catch (addError) {
                console.error('Error adding Sepolia network:', addError);
                alert('Please manually switch to Sepolia testnet in your wallet');
                return;
              }
            } else {
              console.error('Error switching to Sepolia network:', switchError);
              alert('Please manually switch to Sepolia testnet in your wallet');
              return;
            }
          }
        }
        
        setEthAccount(accounts[0]);
        setShowEthDropdown(false);
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
      
      // Get the network information
      const chainId = starknet.provider.chainId;
      console.log('Connected to Starknet network:', chainId);
      
      // Check if we're on Starknet Sepolia testnet
      // SN_SEPOLIA = 0x534e5f5345504f4c4941 (hex for "SN_SEPOLIA")
      if (chainId !== '0x534e5f5345504f4c4941') {
        try {
          // Try to switch to Sepolia testnet
          await starknet.request({
            type: 'wallet_switchStarknetChain',
            params: { chainId: '0x534e5f5345504f4c4941' }
          });
        } catch (error) {
          console.error('Error switching to Starknet Sepolia testnet:', error);
          alert(`Please switch to Starknet Sepolia testnet in your wallet. Current network: ${chainId}`);
          return;
        }
      }
      
      setStarknetAccount(starknet.account);
      setShowStarknetDropdown(false);
    } catch (error) {
      console.error("Error connecting to Starknet wallet:", error);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectEthWallet = () => {
    setEthAccount(null);
  };

  const disconnectStarknetWallet = () => {
    setStarknetAccount(null);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const isWalletConnected = ethAccount || starknetAccount;

  const value = {
    ethAccount,
    starknetAccount,
    connecting,
    showEthDropdown,
    showStarknetDropdown,
    isWalletConnected,
    connectEthWallet,
    connectStarknetWallet,
    disconnectEthWallet,
    disconnectStarknetWallet,
    formatAddress,
    setShowEthDropdown,
    setShowStarknetDropdown
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}; 