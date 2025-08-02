import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './SwapPage.css';
import { useWallet } from '../contexts/WalletContext';
import { Contract, uint256, hash } from 'starknet';

function SwapPage() {
  const { 
    isWalletConnected, 
    ethAccount, 
    starknetAccount,
    ethBalance,
    checkSufficientBalance,
    createLimitOrder,
    depositToHTLC,
    generateHashlock,
    withdrawFromHTLC,
    cancelEscrow,
    getEscrowDetails,
    canWithdrawFromEscrow,
    canCancelEscrow,
    HTLC_CONTRACT_ADDRESS
  } = useWallet();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('STRK');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [takerAddress, setTakerAddress] = useState(''); // New: taker address input
  const [orderId, setOrderId] = useState('');
  const [limitOrderHash, setLimitOrderHash] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [depositError, setDepositError] = useState('');
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [message, setMessage] = useState('');
  
  // Additional state variables for compatibility
  const [secretKey, setSecretKey] = useState('');
  const [secretHash, setSecretHash] = useState('');
  const [txHash, setTxHash] = useState('');
  const [htlcHash, setHtlcHash] = useState('');
  const [depositStatus, setDepositStatus] = useState('');
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [strkBalance, setStrkBalance] = useState('0');
  
  // New state for escrow testing
  const [escrowAddress, setEscrowAddress] = useState('');
  const [secret, setSecret] = useState('');
  const [hashlock, setHashlock] = useState('');
  const [escrowDetails, setEscrowDetails] = useState(null);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);
  const [cancellationSuccess, setCancellationSuccess] = useState(false);
  const [canWithdraw, setCanWithdraw] = useState(false);
  const [canCancel, setCanCancel] = useState(false);

  // Exchange rate: 0.1 ETH = 300 STRK
  const EXCHANGE_RATE = 3000; // 300 STRK / 0.1 ETH = 3000 STRK per ETH
  
  // Contract addresses
  const starknetContractAddress = '0x057dcc8c6f5a214c3bc3d6c62a311977f0e73f34c89a7a0b3e3c9a7c5febfe69';

  // Steps for the progress bar
  const steps = [
    { number: 1, label: 'SWAP INPUT', status: 'completed' },
    { number: 2, label: 'DEPOSIT ETH', status: 'active' },
    { number: 3, label: 'WAIT FOR TAKER', status: 'pending' },
    { number: 4, label: 'CLAIM TOKENS', status: 'pending' }
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
    if (currentStep === 3 && timeRemaining > 0) {
      timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [currentStep, timeRemaining]);

  // Calculate exchange rate when fromAmount changes
  useEffect(() => {
    if (fromAmount && !isNaN(fromAmount)) {
      const amount = parseFloat(fromAmount);
      if (fromToken === 'ETH' && toToken === 'STRK') {
        setToAmount((amount * EXCHANGE_RATE).toFixed(2));
      } else if (fromToken === 'STRK' && toToken === 'ETH') {
        setToAmount((amount / EXCHANGE_RATE).toFixed(6));
      }
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromToken, toToken]);

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
      setDepositError('Please connect your Ethereum wallet first');
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setDepositError('Please enter a valid amount');
      return;
    }

    // Check if user has sufficient balance
    if (!checkSufficientBalance(fromAmount)) {
      const required = parseFloat(fromAmount) + 0.001;
      setDepositError(`Insufficient balance. You need at least ${required.toFixed(4)} ETH (${fromAmount} ETH + ~0.001 ETH for gas). Current balance: ${parseFloat(ethBalance).toFixed(4)} ETH`);
      return;
    }

    setIsProcessing(true);
    setDepositError('');
    setDepositSuccess(false);

    try {
      // Generate hashlock and secret
      const { secret, hashlock } = generateHashlock();
      
      // Set timelock to 5 minutes from now
      const timelock = Math.floor(Date.now() / 1000) + 300; // 5 minutes

      console.log('Starting deposit process:', {
        amount: fromAmount,
        hashlock,
        timelock,
        contractAddress: HTLC_CONTRACT_ADDRESS,
        ethAccount,
        ethBalance
      });

      // Deposit ETH to HTLC contract using current user as taker for demo
      const result = await depositToHTLC(fromAmount, hashlock, ethAccount, timelock);
      
      if (result.success) {
        setLimitOrderHash(result.transactionHash);
        setDepositSuccess(true);
        
        // Store the secret for later use (in a real app, this would be shared securely)
        localStorage.setItem('htlc_secret', secret);
        localStorage.setItem('htlc_hashlock', hashlock);
        
        console.log('HTLC created successfully:', {
          transactionHash: result.transactionHash,
          secret,
          hashlock
        });
        
        // Simulate relayer processing
        setTimeout(() => {
          setIsProcessing(false);
          setCurrentStep(3);
        }, 3000);
      }
    } catch (error) {
      console.error('Error during deposit:', error);
      
      // Provide more specific error messages based on error type
      let errorMessage = error.message || 'Failed to deposit to HTLC contract';
      
      if (error.message.includes('execution reverted')) {
        errorMessage = 'Contract execution failed. This might be due to invalid parameters or contract state.';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction. Please ensure you have enough ETH for both the deposit and gas fees.';
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction was rejected. Please try again.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setDepositError(errorMessage);
      setIsProcessing(false);
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

  const handleDeposit = async () => {
    if (!isWalletConnected) {
      setMessage('Please connect your wallet first');
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }



    // Check if user has sufficient balance
    if (!checkSufficientBalance(fromAmount)) {
      const required = parseFloat(fromAmount) + 0.001;
      setMessage(`Insufficient balance. You need at least ${required.toFixed(4)} ETH (${fromAmount} ETH + ~0.001 ETH for gas). Current balance: ${parseFloat(ethBalance).toFixed(4)} ETH`);
      return;
    }

    setIsProcessing(true);
    setMessage('');

    try {
      // Generate order ID and hash
      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const limitOrderHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(orderId));
      
      setOrderId(orderId);
      setLimitOrderHash(limitOrderHash);

      // Generate hashlock and secret for HTLC
      const { secret: generatedSecret, hashlock: generatedHashlock } = generateHashlock();
      
      // Store the secret and hashlock for later use
      setSecret(generatedSecret);
      setHashlock(generatedHashlock);
      
      // Set timelock (1 hour from now)
      const timelock = Math.floor(Date.now() / 1000) + 3600;
      
      // Deposit to HTLC contract using the current user as taker for demo
      const result = await depositToHTLC(fromAmount, generatedHashlock, ethAccount, timelock);
      
      // Extract escrow address from the transaction receipt
      // The escrow address should be in the event logs
      if (result.receipt && result.receipt.events) {
        const escrowCreatedEvent = result.receipt.events.find(event => event.event === 'EscrowCreated');
        if (escrowCreatedEvent) {
          setEscrowAddress(escrowCreatedEvent.args.escrow);
        }
      }
      
      setMessage(`✅ ETH deposited successfully! Transaction: ${result.transactionHash}`);
      setDepositSuccess(true);
      
      // Move to next step after successful deposit
      setTimeout(() => {
        setIsProcessing(false);
        setCurrentStep(3);
      }, 2000);
      
    } catch (error) {
      console.error('Error during deposit:', error);
      
      let errorMessage = error.message || 'Failed to deposit ETH';
      
      if (error.message.includes('execution reverted')) {
        errorMessage = 'Contract execution failed. This might be due to invalid parameters or contract state.';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction. Please ensure you have enough ETH for both the deposit and gas fees.';
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction was rejected. Please try again.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setMessage(`❌ Error: ${errorMessage}`);
      setIsProcessing(false);
    }
  };



  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    // Reset amounts when switching
    setFromAmount('');
    setToAmount('');
  };

  // Function to get escrow details
  const handleGetEscrowDetails = async () => {
    if (!escrowAddress) {
      setMessage('❌ No escrow address available');
      return;
    }

    setIsProcessing(true);
    setMessage('');

    try {
      const details = await getEscrowDetails(escrowAddress);
      setEscrowDetails(details);
      
      // Check if current user can withdraw or cancel
      const canWithdrawResult = await canWithdrawFromEscrow(escrowAddress);
      const canCancelResult = await canCancelEscrow(escrowAddress);
      
      setCanWithdraw(canWithdrawResult);
      setCanCancel(canCancelResult);
      
      setMessage(`✅ Escrow details loaded successfully!`);
    } catch (error) {
      console.error('Error getting escrow details:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to withdraw from escrow
  const handleWithdraw = async () => {
    if (!escrowAddress || !secret) {
      setMessage('❌ Escrow address or secret not available');
      return;
    }

    if (!canWithdraw) {
      setMessage('❌ You are not the taker for this escrow. Only the taker can withdraw.');
      return;
    }

    setIsProcessing(true);
    setMessage('');

    try {
      const result = await withdrawFromHTLC(escrowAddress, secret);
      setMessage(`✅ Withdrawal successful! Transaction: ${result.transactionHash}`);
      setWithdrawalSuccess(true);
      
      // Update balance after withdrawal
      setTimeout(() => {
        window.location.reload(); // Refresh to update balance
      }, 2000);
    } catch (error) {
      console.error('Error withdrawing from escrow:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to cancel escrow
  const handleCancelEscrow = async () => {
    if (!escrowAddress) {
      setMessage('❌ No escrow address available');
      return;
    }

    if (!canCancel) {
      setMessage('❌ You are not the maker for this escrow. Only the maker can cancel.');
      return;
    }

    setIsProcessing(true);
    setMessage('');

    try {
      const result = await cancelEscrow(escrowAddress);
      setMessage(`✅ Escrow cancelled successfully! Transaction: ${result.transactionHash}`);
      setCancellationSuccess(true);
      
      // Update balance after cancellation
      setTimeout(() => {
        window.location.reload(); // Refresh to update balance
      }, 2000);
    } catch (error) {
      console.error('Error cancelling escrow:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStep1 = () => (
    <div className="swap-section">
      <h2>Step 1: Enter Swap Details</h2>
      
      {/* Network Information */}
      <div className="network-info">
        <div className="network-item">
          <span className="network-label">From Network:</span>
          <span className="network-value">
            {fromToken === 'ETH' ? 'Sepolia Testnet' : 'StarkNet Sepolia'}
          </span>
        </div>
        <div className="network-item">
          <span className="network-label">To Network:</span>
          <span className="network-value">
            {toToken === 'ETH' ? 'Sepolia Testnet' : 'StarkNet Sepolia'}
          </span>
        </div>
        {ethAccount && (
          <div className="network-item">
            <span className="network-label">Wallet Balance:</span>
            <span className="network-value">
              {parseFloat(ethBalance).toFixed(4)} ETH
            </span>
          </div>
        )}
      </div>

      {/* Exchange Rate Display */}
      <div className="exchange-rate">
        <span>Exchange Rate: 0.1 ETH = 300 STRK</span>
      </div>

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
              step="0.01"
              min="0"
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
          {fromToken === 'ETH' && ethAccount && fromAmount && (
            <div className="balance-info">
              <span>Available: {parseFloat(ethBalance).toFixed(4)} ETH</span>
              {parseFloat(fromAmount) > parseFloat(ethBalance) && (
                <span className="insufficient-balance">Insufficient balance</span>
              )}
            </div>
          )}
        </div>
        
        <div className="swap-arrow" onClick={switchTokens}>
          ↓
        </div>
        
        <div className="token-input">
          <label>To (Calculated)</label>
          <div className="input-container">
            <input
              type="number"
              placeholder="0.0"
              value={toAmount}
              readOnly
              className="calculated-input"
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
        disabled={!fromAmount || !toAmount || !isWalletConnected}
      >
        {!isWalletConnected ? 'Connect Wallet to Swap' : 'Agree to Swap'}
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="swap-section">

      <h2>Step 2: Lock Your Tokens</h2>

      <h2>Step 2: Deposit ETH</h2>

      
      {!isProcessing ? (
        <>
          <div className="warning-box">
            <h3>⚠️ Important Warning</h3>
            <p>You are about to deposit {fromAmount} ETH to create an HTLC + Limit Order swap.</p>
            <p>This action will lock your ETH in the HTLC contract. Make sure you understand the terms.</p>
          </div>
          
          <div className="swap-summary">
            <h3>Swap Summary</h3>
            <div className="summary-item">
              <span>You Deposit:</span>
              <span>{fromAmount} ETH (Sepolia Testnet)</span>
            </div>
            <div className="summary-item">
              <span>You Receive:</span>
              <span>{toAmount} STRK (StarkNet Sepolia)</span>
            </div>
            <div className="summary-item">
              <span>Exchange Rate:</span>
              <span>0.1 ETH = 300 STRK</span>
            </div>
            <div className="summary-item">
              <span>HTLC Contract:</span>
              <span className="hash">0x53195abE02b3fc143D325c29F6EA2c963C8e9fc6</span>
            </div>
            {ethAccount && (
              <div className="summary-item">
                <span>Your Balance:</span>
                <span>{parseFloat(ethBalance).toFixed(4)} ETH</span>
              </div>
            )}

          </div>

          {message && (
            <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
          
          <button 
            className="release-button" 
            onClick={handleDeposit}
            disabled={!ethAccount || !fromAmount || !checkSufficientBalance(fromAmount)}
          >
            {!ethAccount ? 'Connect ETH Wallet' : `Deposit ${fromAmount} ETH`}
          </button>
        </>
      ) : (
        <div className="processing-section">
          <div className="processing-spinner"></div>
          <h3>Processing Your Deposit</h3>
          <p>Depositing ETH to HTLC contract...</p>
          {depositSuccess && (
            <div className="success-message">
              <p>✅ ETH deposited to HTLC contract successfully!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );





  const renderStep3 = () => (
    <div className="swap-section">
      <h2>Step 3: Waiting for Taker</h2>
      
      {!isProcessing ? (
        <>
          <div className="waiting-info">
            <h3>⏳ HTLC Status: Active</h3>
            <p>Your ETH has been locked in the HTLC contract. Waiting for a taker to complete the swap.</p>
          </div>
          
          <div className="order-details">
            <h3>HTLC Details</h3>
            <div className="detail-item">
              <span>Order ID:</span>
              <span className="hash">{orderId}</span>
            </div>
            <div className="detail-item">
              <span>Limit Order Hash:</span>
              <span className="hash">{limitOrderHash}</span>
            </div>
            <div className="detail-item">
              <span>HTLC Contract:</span>
              <span className="hash">0x53195abE02b3fc143D325c29F6EA2c963C8e9fc6</span>
            </div>
            <div className="detail-item">
              <span>Amount Locked:</span>
              <span>{fromAmount} ETH</span>
            </div>
            <div className="detail-item">
              <span>Expected Return:</span>
              <span>{toAmount} STRK</span>
            </div>
            <div className="detail-item">
              <span>Time Remaining:</span>
              <span><strong>{formatTime(timeRemaining)}</strong></span>
            </div>
          </div>

          <div className="status-indicator">
            <div className="status-dot active"></div>
            <span>HTLC Active - Waiting for Taker</span>
          </div>
          
          <button 
            className="claim-button" 
            onClick={() => setCurrentStep(4)}
            disabled={timeRemaining > 0}
          >
            {timeRemaining > 0 ? `Wait ${formatTime(timeRemaining)}` : 'Proceed to Claim'}
          </button>
        </>
      ) : (
        <div className="processing-section">
          <div className="processing-spinner"></div>
          <h3>Processing HTLC</h3>
          <p>Setting up your HTLC contract...</p>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="swap-section">
      <h2>Step 4: Claim Your Tokens</h2>
      

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
      
      <div className="success-box">
        <h3>✅ Order Filled!</h3>
        <p>Your {toAmount} {toToken} are ready to be claimed on StarkNet Sepolia.</p>
      </div>
      
      <div className="swap-summary">
        <h3>Final Summary</h3>
        <div className="summary-item">
          <span>You Paid:</span>
          <span>{fromAmount} {fromToken} (Sepolia Testnet)</span>
        </div>
        <div className="summary-item">
          <span>You Received:</span>
          <span>{toAmount} {toToken} (StarkNet Sepolia)</span>
        </div>
        <div className="summary-item">
          <span>Order ID:</span>
          <span className="hash">{orderId}</span>
        </div>
        <div className="summary-item">
          <span>Limit Order Hash:</span>
          <span className="hash">{limitOrderHash}</span>
        </div>
      </div>
      
      <button className="claim-button" onClick={handleClaim}>
        Claim {toAmount} {toToken} on StarkNet
      </button>
    </div>
  );

  return (
    <div className="swap-page">
      <div className="swap-container">
        <div className="swap-header">
          <h1>HTLC + Limit Order Swap</h1>
          <p>Secure cross-chain token exchange with integrated limit orders</p>
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
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Message Display */}
        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}


      </div>
    </div>
  );
}

export default SwapPage; 