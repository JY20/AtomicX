import { loadOrder, updateOrderStatus } from '../utils';
import { OrderStatus } from '../types';
import * as dotenv from 'dotenv';

dotenv.config();

async function fundHTLC() {
  try {
    // Get order ID from environment variable
    const orderId = process.env.ORDER_ID;
    
    if (!orderId) {
      console.error('❌ ORDER_ID environment variable not set');
      console.error('Usage: ORDER_ID=order_123 npm run taker:fund');
      process.exit(1);
    }
    
    console.log(`🔍 Loading order ${orderId}...`);
    const order = loadOrder(orderId);
    
    // Check if order is in the correct state
    if (order.status !== OrderStatus.EVM_ESCROW_CREATED) {
      console.error(`❌ Order is in ${order.status} state. Expected ${OrderStatus.EVM_ESCROW_CREATED}`);
      console.error('The maker must create the EVM escrow first');
      process.exit(1);
    }
    
    // Check if Bitcoin HTLC is set
    if (!order.bitcoinHTLC) {
      console.error('❌ Bitcoin HTLC not set in order');
      console.error('The Bitcoin HTLC must be created first');
      process.exit(1);
    }
    
    console.log('\n📝 Funding Bitcoin HTLC...');
    console.log(`🔒 HTLC Address: ${order.bitcoinHTLC.address}`);
    console.log(`💰 Amount: ${order.taker.amount} BTC`);
    
    // Note: In a real implementation, you would create and broadcast a Bitcoin transaction
    // to fund the HTLC. For this example, we'll just simulate it and assume the user has
    // sent the funds manually.
    
    console.log('\n⚠️ Please send exactly the specified amount to the HTLC address.');
    console.log('You can use any Bitcoin wallet to send the funds.');
    
    // Wait for user confirmation
    console.log('\nPress Enter after you have sent the funds...');
    await new Promise(resolve => process.stdin.once('data', resolve));
    
    // Update order status
    const updatedOrder = updateOrderStatus(orderId, OrderStatus.BTC_HTLC_FUNDED);
    
    console.log('\n✅ Bitcoin HTLC funding confirmed!');
    
    console.log('\n📋 Next steps:');
    console.log('1. Maker will claim BTC using their secret');
    console.log('2. You will claim ETH/tokens using the revealed secret');
    
  } catch (error) {
    console.error('❌ Error funding HTLC:', error);
    process.exit(1);
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  fundHTLC();
}

export { fundHTLC }; 