import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AtomicSwap from './components/AtomicSwap';

function App() {
  return (
    <div className="App">
      <Navbar />
      <header className="App-header" id="home">
        <h1>AtomicX</h1>
        <p>
          A powerful platform for atomic swaps and cross-chain transactions
        </p>
        <div className="button-container">
          <button className="primary-button">Get Started</button>
          <button className="secondary-button">Learn More</button>
        </div>
      </header>
      <main>
        <section className="features" id="features">
          <h2>Key Features</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>Atomic Swaps</h3>
              <p>Securely exchange assets across different blockchains without intermediaries</p>
            </div>
            <div className="feature-card">
              <h3>Cross-Chain Transactions</h3>
              <p>Execute transactions across multiple blockchains seamlessly</p>
            </div>
            <div className="feature-card">
              <h3>Enhanced Security</h3>
              <p>Built with advanced cryptographic protocols to ensure transaction safety</p>
            </div>
            <div className="feature-card">
              <h3>User-Friendly Interface</h3>
              <p>Intuitive design for both beginners and experienced users</p>
            </div>
          </div>
        </section>
        
        <AtomicSwap />
      </main>
      <Footer />
    </div>
  );
}

export default App;
