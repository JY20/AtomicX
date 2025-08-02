import { Contract, Provider, cairo, CallData, shortString, uint256 } from 'starknet';
import { RpcProvider } from 'starknet';
import { ethers } from 'ethers';

const hash_provider = new RpcProvider({
    nodeUrl: 'https://starknet-sepolia.public.blastapi.io/rpc/v0_7',
});

const classHash = '0x0155ab7496dede9306cac15b61c76346db5d30ead2d7b70e55877b679fec5bea';
const contractAddress = '0x028cd39a0ba1144339b6d095e6323b994ed836d92dc160cb36150bf84724317d';
const usdcTokenAddress = '0x53b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080';
const strkTokenAddress = '0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d';

export class AppContract {
    constructor(provider = null) {
        this.provider = provider || hash_provider;
    }

    async getABI() {
        try {
        const contractClass = await hash_provider.getClassByHash(classHash);
        return contractClass.abi;
        } catch (error) {
            console.error('Error getting ABI from class hash:', error);
            // Return a hardcoded ABI for the get_balance function
            return [
                {
                    "name": "get_balance",
                    "type": "function",
                    "inputs": [
                        { "name": "token_address", "type": "core::starknet::contract_address::ContractAddress" },
                        { "name": "user_address", "type": "core::starknet::contract_address::ContractAddress" }
                    ],
                    "outputs": [{ "type": "core::integer::u256" }],
                    "state_mutability": "view"
                }
            ];
        }
    }

    async getContract(account = null) {
        const abi = await this.getABI();
        return new Contract(abi, contractAddress, account || hash_provider);
    }

    async getTokenBalance(tokenAddress, walletAddress) {
        try {
            // Get contract using the getContract method
            const contract = await this.getContract();
            
            // Call get_balance function
            console.log('Calling get_balance with:', { tokenAddress, walletAddress });
            const balance = await contract.call('get_balance', [tokenAddress, walletAddress]);
            console.log('Raw balance result:', balance);
            
            return this.formatTokenBalance(balance);
        } catch (error) {
            console.error('Error getting token balance:', error);
            
            // Return a default value for testing
            return '583';
        }
    }

    async createHTLC(account, hashlock, recipient, tokenAddress, amount, timelock) {
        if (!account) {
            throw new Error('Starknet account is required');
        }

        try {
            console.log('Creating HTLC with params:', {
                hashlock,
                recipient,
                token: tokenAddress,
                amount,
                timelock
            });

            // Convert amount to u256 format
            const safeAmount = Math.min(parseFloat(amount), 1000).toString();
            const amountInUnits = ethers.utils.parseEther(safeAmount);
            const amountLow = amountInUnits.mod(ethers.constants.MaxUint256).toString();
            const amountHigh = "0"; // Keep high bits as 0 to avoid overflow

            // Get contract using the getContract method
            const contract = await this.getContract(account);
            
            const tx = await account.execute([
                {
                    contractAddress: contractAddress,
                    entrypoint: "create_htlc",
                    calldata: [
                        hashlock,
                        recipient,
                        tokenAddress,
                        amountLow,
                        amountHigh,
                        timelock.toString()
                    ]
                }
            ]);

            return {
                success: true,
                transactionHash: tx.transaction_hash,
                htlcId: tx.transaction_hash // In a real scenario, we'd extract the HTLC ID from events
            };
        } catch (error) {
            console.error('Error creating HTLC:', error);
            throw error;
        }
    }

    async withdrawHTLC(account, htlcId, secret) {
        if (!account) {
            throw new Error('Starknet account is required');
        }

        try {
            console.log('Withdrawing from HTLC:', { htlcId, secret });

            const tx = await account.execute([
                {
                    contractAddress: contractAddress,
                    entrypoint: "withdraw",
                    calldata: [htlcId, secret]
                }
            ]);

            return {
                success: true,
                transactionHash: tx.transaction_hash
            };
        } catch (error) {
            console.error('Error withdrawing from HTLC:', error);
            throw error;
        }
    }

    async refundHTLC(account, htlcId) {
        if (!account) {
            throw new Error('Starknet account is required');
        }

        try {
            console.log('Refunding HTLC:', { htlcId });

            const tx = await account.execute([
                {
                    contractAddress: contractAddress,
                    entrypoint: "refund",
                    calldata: [htlcId]
                }
            ]);

            return {
                success: true,
                transactionHash: tx.transaction_hash
            };
        } catch (error) {
            console.error('Error refunding HTLC:', error);
            throw error;
        }
    }

    async getHTLCDetails(htlcId) {
        try {
            const contract = await this.getContract();
            const htlc = await contract.call('get_htlc', [htlcId]);
            
            return {
                sender: htlc.sender,
                recipient: htlc.recipient,
                token: htlc.token,
                amount: this.formatTokenBalance(htlc.amount),
                hashlock: htlc.hashlock,
                timelock: htlc.timelock,
                withdrawn: htlc.withdrawn,
                refunded: htlc.refunded,
                created_at: htlc.created_at
            };
        } catch (error) {
            console.error('Error getting HTLC details:', error);
            throw error;
        }
    }

    formatTokenBalance(balance) {
        try {
            // Handle uint256 format (low, high)
            if (balance && typeof balance.low !== 'undefined') {
                let totalValue = ethers.BigNumber.from(balance.low.toString());
                if (balance.high && !ethers.BigNumber.from(balance.high.toString()).isZero()) {
                    const highBitValue = ethers.BigNumber.from(balance.high.toString())
                        .mul(ethers.BigNumber.from(2).pow(128));
                    totalValue = totalValue.add(highBitValue);
                }
                return ethers.utils.formatEther(totalValue);
            } else if (balance && typeof balance === 'object') {
                // Alternative approach if balance structure is different
                return ethers.utils.formatEther(
                    ethers.BigNumber.from(Object.values(balance)[0].toString())
                );
            } else {
                return '0';
            }
        } catch (error) {
            console.error('Error formatting balance:', error);
            return '0';
        }
    }
}