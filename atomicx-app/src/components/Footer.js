import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>AtomicX</h3>
          <p>A powerful platform for atomic swaps and cross-chain transactions.</p>
          <div className="social-icons">
            <a href="https://twitter.com" className="social-icon" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="https://discord.com" className="social-icon" target="_blank" rel="noopener noreferrer">Discord</a>
            <a href="https://github.com" className="social-icon" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>Product</h4>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#docs">Documentation</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Company</h4>
          <ul>
            <li><a href="#about">About Us</a></li>
            <li><a href="#careers">Careers</a></li>
            <li><a href="#blog">Blog</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Resources</h4>
          <ul>
            <li><a href="#help">Help Center</a></li>
            <li><a href="#community">Community</a></li>
            <li><a href="#partners">Partners</a></li>
            <li><a href="#terms">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} AtomicX. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer; 