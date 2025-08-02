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
  const [ethProvider, setEthProvider] = useState(null);
  const [ethSigner, setEthSigner] = useState(null);
  const [ethBalance, setEthBalance] = useState('0');

  // Contract addresses
  const HTLC_CONTRACT_ADDRESS = '0x53195abE02b3fc143D325c29F6EA2c963C8e9fc6';
  const ONEINCH_WRAPPER_ADDRESS = '0x5633F8a3FeFF2E8F615CbB17CC29946a51BaEEf9';
  const ATOMIC_SWAP_INTEGRATION_ADDRESS = '0x0000000000000000000000000000000000000000'; // Will be updated after deployment
  
  // Sepolia testnet chain ID
  const SEPOLIA_CHAIN_ID = 11155111;

  useEffect(() => {
    // Check if wallets are already connected
    const checkConnectedWallets = async () => {
      // Check Ethereum wallet
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setEthAccount(accounts[0]);
          setEthProvider(provider);
          setEthSigner(provider.getSigner());
          // Get balance
          const balance = await provider.getBalance(accounts[0]);
          setEthBalance(ethers.utils.formatEther(balance));
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

  // Update balance when account changes
  useEffect(() => {
    const updateBalance = async () => {
      if (ethAccount && ethProvider) {
        try {
          const balance = await ethProvider.getBalance(ethAccount);
          setEthBalance(ethers.utils.formatEther(balance));
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      }
    };

    updateBalance();
  }, [ethAccount, ethProvider]);

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
        
<<<<<<< Updated upstream
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
=======
        // Check if we're on Sepolia testnet
        if (network.chainId !== SEPOLIA_CHAIN_ID) {
          alert(`Please switch to Sepolia Testnet (Chain ID: ${SEPOLIA_CHAIN_ID}). Current network: ${network.name} (Chain ID: ${network.chainId})`);
          return;
>>>>>>> Stashed changes
        }
        
        setEthAccount(accounts[0]);
        setEthProvider(provider);
        setEthSigner(provider.getSigner());
        
        // Get initial balance
        const balance = await provider.getBalance(accounts[0]);
        setEthBalance(ethers.utils.formatEther(balance));
        
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
      
<<<<<<< Updated upstream
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
=======
      // Check if we're on StarkNet Sepolia testnet
      if (chainId !== '0x534e5f5345504f4c4941') { // SN_SEPOLIA in hex
        alert(`Please switch to StarkNet Sepolia testnet. Current network: ${chainId}`);
        return;
>>>>>>> Stashed changes
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
    setEthProvider(null);
    setEthSigner(null);
    setEthBalance('0');
  };

  const disconnectStarknetWallet = () => {
    setStarknetAccount(null);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Function to check if user has sufficient balance
  const checkSufficientBalance = (amount) => {
    const requiredAmount = parseFloat(amount);
    const currentBalance = parseFloat(ethBalance);
    const estimatedGas = 0.001; // Estimated gas cost in ETH
    
    return currentBalance >= (requiredAmount + estimatedGas);
  };

  // Function to deposit ETH into HTLC contract
  const depositToHTLC = async (amount, hashlock, takerAddress, timelock) => {
    if (!ethSigner) {
      throw new Error('Ethereum wallet not connected');
    }

    // Check if user has sufficient balance
    if (!checkSufficientBalance(amount)) {
      const required = parseFloat(amount) + 0.001; // amount + estimated gas
      throw new Error(`Insufficient balance. You need at least ${required.toFixed(4)} ETH (${amount} ETH + ~0.001 ETH for gas). Current balance: ${parseFloat(ethBalance).toFixed(4)} ETH`);
    }

    try {
      // Updated HTLC contract ABI - using the correct function name
      const htlcABI = [
        "function createSrcEscrow(tuple(bytes32 orderHash, bytes32 hashlock, uint256 maker, uint256 taker, uint256 token, uint256 amount, uint256 safetyDeposit, uint256 timelocks) immutables) external payable returns (address)"
      ];

      const htlcContract = new ethers.Contract(HTLC_CONTRACT_ADDRESS, htlcABI, ethSigner);
      
      // Convert amount to wei
      const amountInWei = ethers.utils.parseEther(amount.toString());
      
      // Create the immutables struct for the contract call
      // maker = current user (depositor), taker = the address that can withdraw
      const immutables = {
        orderHash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("order")), // Placeholder order hash
        hashlock: hashlock,
        maker: ethAccount, // Current user is the maker (depositor)
        taker: takerAddress, // Taker is the address that can withdraw using secret
        token: "0x0000000000000000000000000000000000000000", // ETH address
        amount: amountInWei,
        safetyDeposit: ethers.utils.parseEther("0.001"), // Small safety deposit
        timelocks: timelock
      };
      
      console.log('Attempting to deposit:', {
        amount: amount,
        amountInWei: amountInWei.toString(),
        hashlock: hashlock,
        maker: ethAccount,
        taker: takerAddress,
        timelock: timelock,
        contractAddress: HTLC_CONTRACT_ADDRESS,
        immutables: immutables
      });

      // Estimate gas first
      let gasEstimate;
      try {
        gasEstimate = await htlcContract.estimateGas.createSrcEscrow(
          immutables,
          { value: amountInWei }
        );
        console.log('Estimated gas:', gasEstimate.toString());
      } catch (gasError) {
        console.error('Gas estimation failed:', gasError);
        // Use a default gas limit if estimation fails
        gasEstimate = ethers.BigNumber.from('300000');
      }
      
      // Create transaction with gas limit
      const tx = await htlcContract.createSrcEscrow(
        immutables,
        { 
          value: amountInWei,
          gasLimit: gasEstimate.mul(120).div(100) // Add 20% buffer
        }
      );

      console.log('Deposit transaction sent:', tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Deposit transaction confirmed:', receipt);
      
      // Update balance after transaction
      if (ethProvider && ethAccount) {
        const newBalance = await ethProvider.getBalance(ethAccount);
        setEthBalance(ethers.utils.formatEther(newBalance));
      }
      
      return {
        success: true,
        transactionHash: tx.hash,
        receipt: receipt
      };
    } catch (error) {
      console.error('Error depositing to HTLC:', error);
      
      // Provide more specific error messages
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient funds for transaction. Please ensure you have enough ETH for both the deposit and gas fees.');
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        throw new Error('Transaction failed. Please check your wallet has sufficient funds and try again.');
      } else if (error.code === 'ACTION_REJECTED') {
        throw new Error('Transaction was rejected by user. Please try again.');
      } else if (error.message && error.message.includes('execution reverted')) {
        throw new Error('Contract execution failed. This might be due to invalid parameters or contract state.');
      } else {
        throw new Error(`Transaction failed: ${error.message || 'Unknown error'}`);
      }
    }
  };

  // Function to withdraw from HTLC escrow using secret
  const withdrawFromHTLC = async (escrowAddress, secret) => {
    if (!ethSigner) {
      throw new Error('Ethereum wallet not connected');
    }

    try {
      // Escrow contract ABI for withdrawal
      const escrowABI = [
        "function withdraw(bytes32 secret) external",
        "function cancel() external",
        "function maker() external view returns (address)",
        "function taker() external view returns (address)",
        "function amount() external view returns (uint256)",
        "function hashlock() external view returns (bytes32)",
        "function createdAt() external view returns (uint256)",
        "function timelocks() external view returns (uint256)"
      ];

      const escrowContract = new ethers.Contract(escrowAddress, escrowABI, ethSigner);
      
      // Check if current user is the taker (only taker can withdraw)
      const taker = await escrowContract.taker();
      if (taker.toLowerCase() !== ethAccount.toLowerCase()) {
        throw new Error('Only the taker can withdraw from this escrow. You are not the taker.');
      }
      
      console.log('Attempting to withdraw from escrow:', {
        escrowAddress: escrowAddress,
        secret: secret,
        taker: taker,
        currentUser: ethAccount
      });

      // Estimate gas for withdrawal
      let gasEstimate;
      try {
        gasEstimate = await escrowContract.estimateGas.withdraw(secret);
        console.log('Estimated gas for withdrawal:', gasEstimate.toString());
      } catch (gasError) {
        console.error('Gas estimation failed:', gasError);
        gasEstimate = ethers.BigNumber.from('100000');
      }
      
      // Call withdraw function
      const tx = await escrowContract.withdraw(secret, {
        gasLimit: gasEstimate.mul(120).div(100) // Add 20% buffer
      });

      console.log('Withdrawal transaction sent:', tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Withdrawal transaction confirmed:', receipt);
      
      // Update balance after transaction
      if (ethProvider && ethAccount) {
        const newBalance = await ethProvider.getBalance(ethAccount);
        setEthBalance(ethers.utils.formatEther(newBalance));
      }
      
      return {
        success: true,
        transactionHash: tx.hash,
        receipt: receipt
      };
    } catch (error) {
      console.error('Error withdrawing from HTLC:', error);
      
      if (error.message && error.message.includes('Invalid secret')) {
        throw new Error('Invalid secret provided. Please check the secret and try again.');
      } else if (error.message && error.message.includes('Only taker can withdraw')) {
        throw new Error('Only the taker can withdraw from this escrow. Please check your wallet address.');
      } else if (error.message && error.message.includes('not the taker')) {
        throw new Error('You are not the taker for this escrow. Only the designated taker can withdraw.');
      } else if (error.code === 'ACTION_REJECTED') {
        throw new Error('Transaction was rejected by user. Please try again.');
      } else {
        throw new Error(`Withdrawal failed: ${error.message || 'Unknown error'}`);
      }
    }
  };

  // Function to check if current user can withdraw from escrow
  const canWithdrawFromEscrow = async (escrowAddress) => {
    if (!ethProvider || !ethAccount) {
      return false;
    }

    try {
      const escrowABI = [
        "function taker() external view returns (address)"
      ];

      const escrowContract = new ethers.Contract(escrowAddress, escrowABI, ethProvider);
      const taker = await escrowContract.taker();
      
      return taker.toLowerCase() === ethAccount.toLowerCase();
    } catch (error) {
      console.error('Error checking if user can withdraw:', error);
      return false;
    }
  };

  // Function to check if current user can cancel escrow
  const canCancelEscrow = async (escrowAddress) => {
    if (!ethProvider || !ethAccount) {
      return false;
    }

    try {
      const escrowABI = [
        "function maker() external view returns (address)"
      ];

      const escrowContract = new ethers.Contract(escrowAddress, escrowABI, ethProvider);
      const maker = await escrowContract.maker();
      
      return maker.toLowerCase() === ethAccount.toLowerCase();
    } catch (error) {
      console.error('Error checking if user can cancel:', error);
      return false;
    }
  };

  // Function to cancel escrow after timelock expires
  const cancelEscrow = async (escrowAddress) => {
    if (!ethSigner) {
      throw new Error('Ethereum wallet not connected');
    }

    try {
      // Escrow contract ABI for cancellation
      const escrowABI = [
        "function cancel() external",
        "function maker() external view returns (address)",
        "function taker() external view returns (address)",
        "function createdAt() external view returns (uint256)",
        "function timelocks() external view returns (uint256)"
      ];

      const escrowContract = new ethers.Contract(escrowAddress, escrowABI, ethSigner);
      
      console.log('Attempting to cancel escrow:', {
        escrowAddress: escrowAddress
      });

      // Estimate gas for cancellation
      let gasEstimate;
      try {
        gasEstimate = await escrowContract.estimateGas.cancel();
        console.log('Estimated gas for cancellation:', gasEstimate.toString());
      } catch (gasError) {
        console.error('Gas estimation failed:', gasError);
        gasEstimate = ethers.BigNumber.from('100000');
      }
      
      // Call cancel function
      const tx = await escrowContract.cancel({
        gasLimit: gasEstimate.mul(120).div(100) // Add 20% buffer
      });

      console.log('Cancellation transaction sent:', tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Cancellation transaction confirmed:', receipt);
      
      // Update balance after transaction
      if (ethProvider && ethAccount) {
        const newBalance = await ethProvider.getBalance(ethAccount);
        setEthBalance(ethers.utils.formatEther(newBalance));
      }
      
      return {
        success: true,
        transactionHash: tx.hash,
        receipt: receipt
      };
    } catch (error) {
      console.error('Error canceling escrow:', error);
      
      if (error.message && error.message.includes('Cancellation period not passed')) {
        throw new Error('Cancellation period has not passed yet. Please wait for the timelock to expire.');
      } else if (error.message && error.message.includes('Only maker can cancel')) {
        throw new Error('Only the maker can cancel this escrow. Please check your wallet address.');
      } else if (error.code === 'ACTION_REJECTED') {
        throw new Error('Transaction was rejected by user. Please try again.');
      } else {
        throw new Error(`Cancellation failed: ${error.message || 'Unknown error'}`);
      }
    }
  };

  // Function to get escrow details
  const getEscrowDetails = async (escrowAddress) => {
    if (!ethProvider) {
      throw new Error('Ethereum provider not connected');
    }

    try {
      const escrowABI = [
        "function maker() external view returns (address)",
        "function taker() external view returns (address)",
        "function amount() external view returns (uint256)",
        "function hashlock() external view returns (bytes32)",
        "function createdAt() external view returns (uint256)",
        "function timelocks() external view returns (uint256)",
        "function balance() external view returns (uint256)"
      ];

      const escrowContract = new ethers.Contract(escrowAddress, escrowABI, ethProvider);
      
      const [maker, taker, amount, hashlock, createdAt, timelocks, balance] = await Promise.all([
        escrowContract.maker(),
        escrowContract.taker(),
        escrowContract.amount(),
        escrowContract.hashlock(),
        escrowContract.createdAt(),
        escrowContract.timelocks(),
        escrowContract.balance()
      ]);

      return {
        maker,
        taker,
        amount: ethers.utils.formatEther(amount),
        hashlock,
        createdAt: createdAt.toNumber(),
        timelocks: timelocks.toNumber(),
        balance: ethers.utils.formatEther(balance)
      };
    } catch (error) {
      console.error('Error getting escrow details:', error);
      throw new Error(`Failed to get escrow details: ${error.message || 'Unknown error'}`);
    }
  };

  // Function to generate hashlock
  const generateHashlock = () => {
    const secret = ethers.utils.randomBytes(32);
    const hashlock = ethers.utils.keccak256(secret);
    return {
      secret: ethers.utils.hexlify(secret),
      hashlock: hashlock
    };
  };

  // 1inch Limit Order functions
  const createLimitOrder = async (orderData) => {
    if (!ethAccount || !ethProvider) {
      throw new Error("Ethereum wallet not connected");
    }

    try {
      const signer = ethProvider.getSigner();
      const contract = new ethers.Contract(
        ONEINCH_WRAPPER_ADDRESS,
        [
          "function createLimitOrder(tuple(address makerAsset, address takerAsset, uint256 makerAmount, uint256 takerAmount, address maker, uint256 salt, uint256 deadline) order) external payable",
          "function getNextNonce(address user) external view returns (uint256)"
        ],
        signer
      );

      // Get next nonce
      const nonce = await contract.getNextNonce(ethAccount);
      
      // Create order
      const order = {
        makerAsset: orderData.makerAsset,
        takerAsset: orderData.takerAsset,
        makerAmount: ethers.utils.parseEther(orderData.makerAmount.toString()),
        takerAmount: ethers.utils.parseEther(orderData.takerAmount.toString()),
        maker: ethAccount,
        salt: nonce,
        deadline: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      };

      const tx = await contract.createLimitOrder(order, {
        value: order.makerAsset === ethers.constants.AddressZero ? order.makerAmount : 0
      });

      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Error creating limit order:", error);
      throw error;
    }
  };

  const fillLimitOrder = async (orderData) => {
    if (!ethAccount || !ethProvider) {
      throw new Error("Ethereum wallet not connected");
    }

    try {
      const signer = ethProvider.getSigner();
      const contract = new ethers.Contract(
        ONEINCH_WRAPPER_ADDRESS,
        [
          "function fillLimitOrder(tuple(address makerAsset, address takerAsset, uint256 makerAmount, uint256 takerAmount, address maker, uint256 salt, uint256 deadline) order) external payable"
        ],
        signer
      );

      const tx = await contract.fillLimitOrder(orderData, {
        value: orderData.takerAsset === ethers.constants.AddressZero ? orderData.takerAmount : 0
      });

      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Error filling limit order:", error);
      throw error;
    }
  };

  const cancelLimitOrder = async (orderData) => {
    if (!ethAccount || !ethProvider) {
      throw new Error("Ethereum wallet not connected");
    }

    try {
      const signer = ethProvider.getSigner();
      const contract = new ethers.Contract(
        ONEINCH_WRAPPER_ADDRESS,
        [
          "function cancelLimitOrder(tuple(address makerAsset, address takerAsset, uint256 makerAmount, uint256 takerAmount, address maker, uint256 salt, uint256 deadline) order) external"
        ],
        signer
      );

      const tx = await contract.cancelLimitOrder(orderData);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Error cancelling limit order:", error);
      throw error;
    }
  };

  // Integration functions
  const createAtomicSwapWithLimitOrder = async (htlcData, createLimitOrder, limitOrderData) => {
    if (!ethAccount || !ethProvider) {
      throw new Error("Ethereum wallet not connected");
    }

    try {
      const signer = ethProvider.getSigner();
      const contract = new ethers.Contract(
        ATOMIC_SWAP_INTEGRATION_ADDRESS,
        [
          "function createAtomicSwapWithLimitOrder(tuple(bytes32 orderHash, bytes32 hashlock, uint256 maker, uint256 taker, uint256 token, uint256 amount, uint256 safetyDeposit, uint256 timelocks) immutables, bool createLimitOrder, tuple(address makerAsset, address takerAsset, uint256 makerAmount, uint256 takerAmount, address maker, uint256 salt, uint256 deadline) limitOrderData) external payable"
        ],
        signer
      );

      const tx = await contract.createAtomicSwapWithLimitOrder(
        htlcData,
        createLimitOrder,
        limitOrderData,
        { value: htlcData.amount }
      );
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Error creating atomic swap with limit order:", error);
      throw error;
    }
  };

  const fillLimitOrderWithHTLC = async (limitOrderData, htlcData) => {
    if (!ethAccount || !ethProvider) {
      throw new Error("Ethereum wallet not connected");
    }

    try {
      const signer = ethProvider.getSigner();
      const contract = new ethers.Contract(
        ATOMIC_SWAP_INTEGRATION_ADDRESS,
        [
          "function fillLimitOrderWithHTLC(tuple(address makerAsset, address takerAsset, uint256 makerAmount, uint256 takerAmount, address maker, uint256 salt, uint256 deadline) limitOrderData, tuple(bytes32 orderHash, bytes32 hashlock, uint256 maker, uint256 taker, uint256 token, uint256 amount, uint256 safetyDeposit, uint256 timelocks) immutables) external payable"
        ],
        signer
      );

      const tx = await contract.fillLimitOrderWithHTLC(
        limitOrderData,
        htlcData,
        { value: limitOrderData.takerAmount + htlcData.amount }
      );
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Error filling limit order with HTLC:", error);
      throw error;
    }
  };

  const isWalletConnected = ethAccount || starknetAccount;

  const value = {
    ethAccount,
    starknetAccount,
    connecting,
    showEthDropdown,
    showStarknetDropdown,
    isWalletConnected,
    ethProvider,
    ethSigner,
    ethBalance,
    connectEthWallet,
    connectStarknetWallet,
    disconnectEthWallet,
    disconnectStarknetWallet,
    formatAddress,
    setShowEthDropdown,
    setShowStarknetDropdown,
    depositToHTLC,
    generateHashlock,
    checkSufficientBalance,
    HTLC_CONTRACT_ADDRESS,
    ONEINCH_WRAPPER_ADDRESS,
    createLimitOrder,
    fillLimitOrder,
    cancelLimitOrder,
    createAtomicSwapWithLimitOrder,
    fillLimitOrderWithHTLC,
    ATOMIC_SWAP_INTEGRATION_ADDRESS,
    withdrawFromHTLC,
    cancelEscrow,
    getEscrowDetails,
    canWithdrawFromEscrow,
    canCancelEscrow
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}; 