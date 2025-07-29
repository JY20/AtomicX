import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { ECPairFactory } from 'ecpair';
import { BitcoinHTLC } from '../types';
import { bitcoinNetworks, bitcoinTimelock } from '../config';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize ECPair factory
const ECPair = ECPairFactory(ecc);

// Get Bitcoin network
export function getBitcoinNetwork() {
  const networkName = process.env.BITCOIN_NETWORK || 'testnet4';
  return bitcoinNetworks[networkName as keyof typeof bitcoinNetworks];
}

// Get Bitcoin keypair from private key
export function getBitcoinKeypair() {
  const privateKey = process.env.BITCOIN_PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error('BITCOIN_PRIVATE_KEY not found in environment variables');
  }
  
  return ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'), { network: getBitcoinNetwork() });
}

// Get Bitcoin address from keypair
export function getBitcoinAddress() {
  const address = process.env.BITCOIN_ADDRESS;
  
  if (!address) {
    throw new Error('BITCOIN_ADDRESS not found in environment variables');
  }
  
  return address;
}

// Create HTLC script
export function createHTLC(
  hashlock: string, 
  recipientPubKey: string, 
  refundPubKey: string, 
  timelock: number = bitcoinTimelock
): BitcoinHTLC {
  const network = getBitcoinNetwork();
  
  // Remove 0x prefix if present
  const hashlockHex = hashlock.startsWith('0x') ? hashlock.slice(2) : hashlock;
  
  // Convert public keys to Buffer
  const recipientPubKeyBuffer = Buffer.from(recipientPubKey, 'hex');
  const refundPubKeyBuffer = Buffer.from(refundPubKey, 'hex');
  const hashlockBuffer = Buffer.from(hashlockHex, 'hex');
  
  // Create redeem script for HTLC
  const redeemScript = bitcoin.script.compile([
    bitcoin.opcodes.OP_IF,
    bitcoin.opcodes.OP_SHA256,
    hashlockBuffer,
    bitcoin.opcodes.OP_EQUALVERIFY,
    recipientPubKeyBuffer,
    bitcoin.opcodes.OP_CHECKSIG,
    bitcoin.opcodes.OP_ELSE,
    bitcoin.script.number.encode(timelock),
    bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
    bitcoin.opcodes.OP_DROP,
    refundPubKeyBuffer,
    bitcoin.opcodes.OP_CHECKSIG,
    bitcoin.opcodes.OP_ENDIF
  ]);
  
  // Create P2SH address
  const p2sh = bitcoin.payments.p2sh({
    redeem: { output: redeemScript, network },
    network
  });
  
  // Create P2WSH address (SegWit)
  const p2wsh = bitcoin.payments.p2wsh({
    redeem: { output: redeemScript, network },
    network
  });
  
  return {
    address: p2wsh.address || p2sh.address || '',
    redeemScript: redeemScript.toString('hex'),
    p2sh: p2sh.address || '',
    p2wsh: p2wsh.address || '',
    timelock
  };
}

// Create claim transaction
export function createClaimTx(
  htlcAddress: string,
  redeemScript: string,
  secret: string,
  destinationAddress: string,
  amount: number,
  fee: number
) {
  const network = getBitcoinNetwork();
  
  // Remove 0x prefix if present
  const secretHex = secret.startsWith('0x') ? secret.slice(2) : secret;
  const secretBuffer = Buffer.from(secretHex, 'hex');
  
  // Create transaction
  const tx = new bitcoin.Transaction();
  
  // Add input (from HTLC)
  tx.addInput(Buffer.from(htlcAddress, 'hex'), 0);
  
  // Add output (to destination)
  tx.addOutput(
    bitcoin.address.toOutputScript(destinationAddress, network),
    amount - fee
  );
  
  // Create witness script for claim
  const witness = bitcoin.script.compile([
    secretBuffer,
    bitcoin.opcodes.OP_TRUE,
    Buffer.from(redeemScript, 'hex')
  ]);
  
  // Sign transaction
  const keypair = getBitcoinKeypair();
  const signature = tx.sign(0, keypair, witness, bitcoin.Transaction.SIGHASH_ALL);
  
  // Add witness to transaction
  tx.setWitness(0, [
    signature,
    keypair.publicKey,
    secretBuffer,
    Buffer.from([1]), // OP_TRUE
    Buffer.from(redeemScript, 'hex')
  ]);
  
  return tx.toHex();
}

// Create refund transaction
export function createRefundTx(
  htlcAddress: string,
  redeemScript: string,
  refundAddress: string,
  amount: number,
  fee: number,
  locktime: number
) {
  const network = getBitcoinNetwork();
  
  // Create transaction with locktime
  const tx = new bitcoin.Transaction();
  tx.locktime = locktime;
  
  // Add input (from HTLC)
  tx.addInput(Buffer.from(htlcAddress, 'hex'), 0);
  
  // Add output (to refund address)
  tx.addOutput(
    bitcoin.address.toOutputScript(refundAddress, network),
    amount - fee
  );
  
  // Create witness script for refund
  const witness = bitcoin.script.compile([
    bitcoin.opcodes.OP_FALSE,
    Buffer.from(redeemScript, 'hex')
  ]);
  
  // Sign transaction
  const keypair = getBitcoinKeypair();
  const signature = tx.sign(0, keypair, witness, bitcoin.Transaction.SIGHASH_ALL);
  
  // Add witness to transaction
  tx.setWitness(0, [
    signature,
    keypair.publicKey,
    Buffer.from([0]), // OP_FALSE
    Buffer.from(redeemScript, 'hex')
  ]);
  
  return tx.toHex();
} 