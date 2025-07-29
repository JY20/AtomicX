export interface Order {
  id: string;
  timestamp: number;
  maker: {
    address: string;
    chain: string;
    asset: string;
    amount: string;
  };
  taker: {
    address?: string;
    chain: string;
    asset: string;
    amount: string;
  };
  secret?: string;
  hashlock: string;
  status: OrderStatus;
  evmEscrow?: {
    address: string;
    timelocks: {
      withdrawalPeriod: number;
      cancellationPeriod: number;
    };
  };
  bitcoinHTLC?: {
    address: string;
    redeemScript: string;
    timelock: number;
  };
}

export enum OrderStatus {
  CREATED = "CREATED",
  FILLED = "FILLED",
  EVM_ESCROW_CREATED = "EVM_ESCROW_CREATED",
  BTC_HTLC_FUNDED = "BTC_HTLC_FUNDED",
  BTC_CLAIMED = "BTC_CLAIMED",
  EVM_CLAIMED = "EVM_CLAIMED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export interface Immutables {
  orderHash: string;
  hashlock: string;
  maker: string;
  taker: string;
  token: string;
  amount: string;
  safetyDeposit: string;
  timelocks: string;
}

export interface BitcoinHTLC {
  address: string;
  redeemScript: string;
  p2sh: string;
  p2wsh: string;
  timelock: number;
}

export interface EVMEscrow {
  address: string;
  timelocks: {
    withdrawalPeriod: number;
    cancellationPeriod: number;
  };
}

export interface Network {
  name: string;
  chainId: number;
  rpcUrl: string;
  factoryAddress: string;
  explorerUrl: string;
} 