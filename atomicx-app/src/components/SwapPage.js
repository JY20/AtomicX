import React, { useState, useEffect } from 'react';
import './SwapPage.css';
import { useWallet } from '../contexts/WalletContext';

function SwapPage() {
  const { isWalletConnected } = useWallet();
  const [currentStep, setCurrentStep] = useState(1);
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('STRK');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [htlcHash, setHtlcHash] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes

  const steps = [
    { number: 1, label: 'SWAP INPUT', status: 'completed' },
    { number: 2, label: 'RELEASE TOKENS', status: 'active' },
    { number: 3, label: 'CLAIM TOKENS', status: 'pending' }
  ];

  useEffect(() => {
    let timer;
    if (isProcessing && timeRemaining > 0) {
      timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [isProcessing, timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSwap = () => {
    if (!fromAmount || !toAmount) return;
    setCurrentStep(2);
  };

  const handleRelease = () => {
    // Simulate wallet signature and HTLC generation
    setIsProcessing(true);
    setHtlcHash('0x1234567890abcdef1234567890abcdef12345678');
    
    // Simulate relayer processing
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep(3);
    }, 5000);
  };

  const handleClaim = () => {
    // Claim logic would go here
    console.log('Claiming tokens...');
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
          <label>From</label>
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
        </div>
        
        <div className="swap-arrow" onClick={switchTokens}>
          ↓
        </div>
        
        <div className="token-input">
          <label>To</label>
          <div className="input-container">
            <input
              type="number"
              placeholder="0.0"
              value={toAmount}
              onChange={(e) => setToAmount(e.target.value)}
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
      
      <button 
        className="swap-button" 
        onClick={handleSwap}
        disabled={!fromAmount || !toAmount || !isWalletConnected}
      >
        {!isWalletConnected ? 'Connect Wallet to Swap' : 'Proceed to Release'}
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="swap-section">
      <h2>Step 2: Release Your Tokens</h2>
      
      {!isProcessing ? (
        <>
          <div className="warning-box">
            <h3>⚠️ Important Warning</h3>
            <p>You are about to release {fromAmount} {fromToken} for {toAmount} {toToken}.</p>
            <p>This action will lock your tokens in an HTLC contract. Make sure you understand the terms.</p>
          </div>
          
          <div className="swap-summary">
            <h3>Swap Summary</h3>
            <div className="summary-item">
              <span>You Pay:</span>
              <span>{fromAmount} {fromToken}</span>
            </div>
            <div className="summary-item">
              <span>You Receive:</span>
              <span>{toAmount} {toToken}</span>
            </div>
          </div>
          
          <button className="release-button" onClick={handleRelease}>
            Release {fromAmount} {fromToken}
          </button>
        </>
      ) : (
        <div className="processing-section">
          <div className="processing-spinner"></div>
          <h3>Processing Your Swap</h3>
          <p>HTLC Hash: <code>{htlcHash}</code></p>
          <p>Time Remaining: <strong>{formatTime(timeRemaining)}</strong></p>
          <p>Waiting for relayer to process your transaction...</p>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="swap-section">
      <h2>Step 3: Claim Your Tokens</h2>
      
      <div className="success-box">
        <h3>✅ Swap Completed!</h3>
        <p>Your {toAmount} {toToken} are ready to be claimed.</p>
      </div>
      
      <div className="swap-summary">
        <h3>Final Summary</h3>
        <div className="summary-item">
          <span>You Paid:</span>
          <span>{fromAmount} {fromToken}</span>
        </div>
        <div className="summary-item">
          <span>You Received:</span>
          <span>{toAmount} {toToken}</span>
        </div>
        <div className="summary-item">
          <span>HTLC Hash:</span>
          <span className="hash">{htlcHash}</span>
        </div>
      </div>
      
      <button className="claim-button" onClick={handleClaim}>
        Claim {toAmount} {toToken}
      </button>
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
            <div key={step.number} className={`progress-step ${step.status}`}>
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