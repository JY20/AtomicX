import React, { useState, useEffect } from 'react';
import './SwapPage.css';
import { useWallet } from '../contexts/WalletContext';
import { ethers } from 'ethers';
import { Contract, uint256, hash } from 'starknet';

function SwapPage() {
  const { ethAccount, starknetAccount, isWalletConnected } = useWallet();
  const [currentStep, setCurrentStep] = useState(1);
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('STRK');
  const [fromAmount, setFromAmount] = useState('0.1');
  const [toAmount, setToAmount] = useState('0.1');
  const [htlcHash, setHtlcHash] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [txHash, setTxHash] = useState('');
  const [depositStatus, setDepositStatus] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [secretHash, setSecretHash] = useState('');
  const [ethBalance, setEthBalance] = useState('0');
  const [strkBalance, setStrkBalance] = useState('0');
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  
  // Contract addresses
  const ethContractAddress = '0x53195abE02b3fc143D325c29F6EA2c963C8e9fc6'; // Ethereum Sepolia
  const starknetContractAddress = '0x057dcc8c6f5a214c3bc3d6c62a311977f0e73f34c89a7a0b3e3c9a7c5febfe69'; // Starknet Sepolia (example address)

  // Steps for the progress bar
  const steps = [
    { number: 1, label: 'SWAP INPUT' },
    { number: 2, label: 'LOCK TOKENS' },
    { number: 3, label: 'CLAIM TOKENS' }
  ];

  // Effect to generate a random secret key when the component mounts
  useEffect(() => {
    // Generate a random 32-byte secret key
    const randomBytes = new Uint8Array(32);
    window.crypto.getRandomValues(randomBytes);
    const secret = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    setSecretKey(secret);
    
    // Hash the secret using keccak256
    const hash = ethers.utils.id(secret);
    setSecretHash(hash);
  }, []);

  // Effect to fetch account balances when accounts change
  useEffect(() => {
    const fetchBalances = async () => {
      setIsLoadingBalances(true);
      
      try {
        // Fetch ETH balance if Ethereum account is connected
        if (ethAccount) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const balance = await provider.getBalance(ethAccount);
          setEthBalance(ethers.utils.formatEther(balance));
        } else {
          setEthBalance('0');
        }
        
        // Fetch STRK balance if Starknet account is connected
        if (starknetAccount) {
          try {
            // In a real implementation, we would fetch the actual STRK balance
            // This is a placeholder that simulates fetching the balance
            // const starknetProvider = starknetAccount.provider;
            // const tokenContract = new Contract(StarknetTokenABI, starknetTokenAddress, starknetProvider);
            // const balance = await tokenContract.balanceOf(starknetAccount.address);
            // setStrkBalance(uint256.uint256ToBN(balance).toString() / 1e18);
            
            // For demonstration, we'll set a mock balance
            setStrkBalance('10.0');
          } catch (error) {
            console.error('Error fetching STRK balance:', error);
            setStrkBalance('0');
          }
        } else {
          setStrkBalance('0');
        }
      } catch (error) {
        console.error('Error fetching balances:', error);
      } finally {
        setIsLoadingBalances(false);
      }
    };
    
    fetchBalances();
    
    // Set up an interval to refresh balances every 30 seconds
    const intervalId = setInterval(fetchBalances, 30000);
    
    return () => clearInterval(intervalId);
  }, [ethAccount, starknetAccount]);

  useEffect(() => {
    let timer;
    if (isProcessing && timeRemaining > 0) {
      timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [isProcessing, timeRemaining]);

  // Calculate equivalent STRK amount based on ETH amount (1:1 ratio for simplicity)
  useEffect(() => {
    if (fromToken === 'ETH') {
      setToAmount(fromAmount);
    } else {
      setFromAmount(toAmount);
    }
  }, [fromAmount, toAmount, fromToken]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBalance = (balance) => {
    // Format balance to 4 decimal places
    return parseFloat(balance).toFixed(4);
  };

  const handleSwap = () => {
    if (!fromAmount) return;
    setCurrentStep(2);
  };

  const handleRelease = async () => {
    if (!ethAccount) {
      alert('Please connect your Ethereum wallet first');
      return;
    }

    // Check if user has enough balance
    if (parseFloat(fromAmount) > parseFloat(ethBalance)) {
      alert(`Insufficient ETH balance. You have ${ethBalance} ETH available.`);
      return;
    }

    setIsProcessing(true);
    setDepositStatus('Initiating deposit transaction...');

    try {
      // Get the Ethereum provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Create transaction parameters
      const txParams = {
        to: ethContractAddress,
        value: ethers.utils.parseEther(fromAmount),
        gasLimit: 100000,
      };

      // Send the transaction
      const tx = await signer.sendTransaction(txParams);
      setTxHash(tx.hash);
      setDepositStatus('Transaction submitted! Waiting for confirmation...');
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        // Transaction successful
        setDepositStatus('ETH locked successfully! STRK tokens are now claimable on Starknet Sepolia testnet.');
        setHtlcHash(receipt.transactionHash);
        
        // Save user data
        const userData = {
          userAddress: ethAccount,
          starknetAddress: starknetAccount?.address,
          amount: fromAmount,
          txHash: receipt.transactionHash,
          secretHash: secretHash,
          secretKey: secretKey,
          timestamp: new Date().toISOString()
        };
        
        // Send deposit data to backend
        try {
          const response = await fetch('http://localhost:5000/api/deposit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });
          
          if (!response.ok) {
            console.error('Failed to save deposit data to server');
          }
        } catch (apiError) {
          console.error('API error:', apiError);
        }
        
        setTimeout(() => {
          setIsProcessing(false);
          setCurrentStep(3);
        }, 2000);
      } else {
        // Transaction failed
        setDepositStatus('Transaction failed. Please try again.');
        setTimeout(() => {
          setIsProcessing(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error during deposit:', error);
      setDepositStatus(`Transaction failed: ${error.message}`);
      setTimeout(() => {
        setIsProcessing(false);
      }, 2000);
    }
  };

  const handleClaim = async () => {
    if (!starknetAccount) {
      alert('Please connect your Starknet wallet to claim STRK tokens');
      return;
    }

    setIsProcessing(true);
    setDepositStatus('Claiming STRK tokens on Starknet Sepolia testnet...');

    try {
      // In a real implementation, this would interact with a Starknet contract
      // For demonstration purposes, we're simulating the interaction
      
      // Example of how to interact with a Starknet contract:
      /*
      const provider = starknetAccount.provider;
      const starknetHTLC = new Contract(
        StarknetHTLCABI,
        starknetContractAddress,
        provider
      );
      
      // Convert the secret key to a felt (field element)
      const secretKeyFelt = hash.pedersen([secretKey]);
      
      // Call the withdraw function on the Starknet HTLC contract
      const { transaction_hash } = await starknetAccount.execute({
        contractAddress: starknetContractAddress,
        entrypoint: 'withdraw',
        calldata: [htlcHash, secretKeyFelt]
      });
      
      // Wait for transaction to be accepted
      await provider.waitForTransaction(transaction_hash);
      */
      
      // Simulate successful claim for demonstration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update the swap status in the backend
      const response = await fetch('http://localhost:5000/api/swaps/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          txHash: txHash || htlcHash,
          status: 'claimed'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update swap status');
      }

      setDepositStatus('STRK tokens claimed successfully on Starknet Sepolia testnet!');
      
      setTimeout(() => {
        setIsProcessing(false);
        // Reset the form for a new swap
        setCurrentStep(1);
        setFromAmount('0.1');
        setToAmount('0.1');
        setTxHash('');
        setHtlcHash('');
      }, 2000);
    } catch (error) {
      console.error('Error claiming tokens:', error);
      setDepositStatus(`Claim failed: ${error.message}`);
      setTimeout(() => {
        setIsProcessing(false);
      }, 2000);
    }
  };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const renderStep1 = () => (
    <div className="swap-section">
      <h2>Step 1: Enter Swap Details</h2>
      <div className="swap-input-group">
        <div className="token-input">
          <div className="label-balance-row">
            <label>From</label>
            <div className="balance-display">
              Balance: {isLoadingBalances ? '...' : fromToken === 'ETH' ? formatBalance(ethBalance) : formatBalance(strkBalance)} {fromToken}
            </div>
          </div>
          <div className="input-container">
            <input
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
            />
            <div className="token-selector">
              <img 
                src={`/${fromToken === 'ETH' ? 'ethereum' : 'starknet'}.png`} 
                alt={`${fromToken} logo`} 
                className="token-logo"
              />
              <span>{fromToken}</span>
            </div>
          </div>
          {parseFloat(fromAmount) > parseFloat(fromToken === 'ETH' ? ethBalance : strkBalance) && (
            <div className="error-message">Insufficient balance</div>
          )}
        </div>
        
        <div className="swap-arrow" onClick={switchTokens}>
          ↓
        </div>
        
        <div className="token-input">
          <div className="label-balance-row">
            <label>To</label>
            <div className="balance-display">
              Balance: {isLoadingBalances ? '...' : toToken === 'ETH' ? formatBalance(ethBalance) : formatBalance(strkBalance)} {toToken}
            </div>
          </div>
          <div className="input-container">
            <input
              type="number"
              placeholder="0.0"
              value={toAmount}
              onChange={(e) => setToAmount(e.target.value)}
              readOnly={fromToken === 'ETH'} // Make it read-only when swapping ETH to STRK
            />
            <div className="token-selector">
              <img 
                src={`/${toToken === 'ETH' ? 'ethereum' : 'starknet'}.png`} 
                alt={`${toToken} logo`} 
                className="token-logo"
              />
              <span>{toToken}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="network-info">
        <div className="network-item">
          <span>From Network:</span>
          <span className="network-name">Ethereum Sepolia Testnet</span>
        </div>
        <div className="network-item">
          <span>To Network:</span>
          <span className="network-name">Starknet Sepolia Testnet</span>
        </div>
      </div>
      
      <button 
        className="swap-button" 
        onClick={handleSwap}
        disabled={
          !fromAmount || 
          !isWalletConnected || 
          parseFloat(fromAmount) > parseFloat(fromToken === 'ETH' ? ethBalance : strkBalance)
        }
      >
        {!isWalletConnected 
          ? 'Connect Wallet to Swap' 
          : parseFloat(fromAmount) > parseFloat(fromToken === 'ETH' ? ethBalance : strkBalance)
            ? 'Insufficient Balance'
            : 'Proceed to Lock Tokens'
        }
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="swap-section">
      <h2>Step 2: Lock Your Tokens</h2>
      
      {!isProcessing ? (
        <>
          <div className="warning-box">
            <h3>⚠️ Important Warning</h3>
            <p>You are about to lock {fromAmount} {fromToken} in the HTLC contract on Ethereum Sepolia testnet.</p>
            <p>Contract Address: <code>{ethContractAddress}</code></p>
            <p>This action will make {toAmount} {toToken} claimable on the Starknet Sepolia testnet.</p>
          </div>
          
          <div className="swap-summary">
            <h3>Swap Summary</h3>
            <div className="summary-item">
              <span>You Lock:</span>
              <span>{fromAmount} {fromToken}</span>
            </div>
            <div className="summary-item">
              <span>You Will Receive:</span>
              <span>{toAmount} {toToken}</span>
            </div>
            <div className="summary-item">
              <span>Secret Hash:</span>
              <span className="hash">{secretHash ? `${secretHash.substring(0, 10)}...${secretHash.substring(secretHash.length - 8)}` : 'Generating...'}</span>
            </div>
            <div className="summary-item">
              <span>Available Balance:</span>
              <span>{fromToken === 'ETH' ? formatBalance(ethBalance) : formatBalance(strkBalance)} {fromToken}</span>
            </div>
          </div>
          
          <button 
            className="release-button" 
            onClick={handleRelease}
            disabled={parseFloat(fromAmount) > parseFloat(fromToken === 'ETH' ? ethBalance : strkBalance)}
          >
            {parseFloat(fromAmount) > parseFloat(fromToken === 'ETH' ? ethBalance : strkBalance) 
              ? 'Insufficient Balance' 
              : `Lock ${fromAmount} ${fromToken}`
            }
          </button>
        </>
      ) : (
        <div className="processing-section">
          <div className="processing-spinner"></div>
          <h3>Processing Your Transaction</h3>
          <p>{depositStatus}</p>
          {txHash && (
            <p>Transaction Hash: <code>{txHash}</code></p>
          )}
          <p>Time Remaining: <strong>{formatTime(timeRemaining)}</strong></p>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="swap-section">
      <h2>Step 3: Claim Your Tokens</h2>
      
      {!isProcessing ? (
        <>
          <div className="success-box">
            <h3>✅ Tokens Locked Successfully!</h3>
            <p>Your {fromAmount} {fromToken} have been locked in the HTLC contract on Ethereum Sepolia testnet.</p>
            <p>You can now claim {toAmount} {toToken} on the Starknet Sepolia testnet.</p>
          </div>
          
          <div className="swap-summary">
            <h3>Final Summary</h3>
            <div className="summary-item">
              <span>You Locked:</span>
              <span>{fromAmount} {fromToken}</span>
            </div>
            <div className="summary-item">
              <span>You Will Receive:</span>
              <span>{toAmount} {toToken}</span>
            </div>
            <div className="summary-item">
              <span>Transaction Hash:</span>
              <span className="hash">{txHash || htlcHash}</span>
            </div>
            <div className="summary-item">
              <span>Secret Key:</span>
              <span className="hash">{secretKey ? `${secretKey.substring(0, 10)}...${secretKey.substring(secretKey.length - 8)}` : 'N/A'}</span>
            </div>
            <div className="summary-item">
              <span>Starknet Contract:</span>
              <span className="hash">{starknetContractAddress}</span>
            </div>
            <div className="summary-item">
              <span>Available STRK Balance:</span>
              <span>{formatBalance(strkBalance)} STRK</span>
            </div>
          </div>
          
          <button className="claim-button" onClick={handleClaim}>
            Claim {toAmount} {toToken} on Starknet
          </button>
        </>
      ) : (
        <div className="processing-section">
          <div className="processing-spinner"></div>
          <h3>Claiming Your Tokens</h3>
          <p>{depositStatus}</p>
          <p>Time Remaining: <strong>{formatTime(timeRemaining)}</strong></p>
        </div>
      )}
    </div>
  );

  return (
    <div className="swap-page">
      <div className="swap-container">
        <div className="swap-header">
          <h1>Atomic Swap</h1>
          <p>Secure cross-chain token exchange</p>
        </div>
        
        {/* Progress Bar */}
        <div className="progress-bar">
          <div className="progress-line"></div>
          {steps.map((step, index) => (
            <div key={step.number} className={`progress-step ${currentStep >= step.number ? 'completed' : currentStep === step.number - 1 ? 'active' : 'pending'}`}>
              <div className="step-circle">
                <span>{step.number}</span>
              </div>
              <div className="step-label">{step.label}</div>
            </div>
          ))}
        </div>
        
        <div className="swap-card">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>
      </div>
    </div>
  );
}

export default SwapPage; 