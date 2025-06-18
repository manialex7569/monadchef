// Monad direct RPC polling service
import { ingredientTypes, dishTypes, COOKED_DISH_EMOJIS } from '@/components/constants';

export const MONAD_RPC_URL = 'https://testnet-rpc.monad.xyz';

// Transaction and block interfaces remain the same
export interface MonadTransaction {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  gasPrice: string;
  gasUsed?: string;
  blockNumber: number;
  blockHash: string;
  transactionIndex: number;
  timestamp: number;
  input: string;
  status?: number;
  type: string;
  methodId?: string;
  decoded?: any;
}

export interface MonadBlock {
  number: number;
  hash: string;
  timestamp: number;
  transactions: MonadTransaction[];
  gasUsed: string;
  gasLimit: string;
  miner: string;
  difficulty: string;
  totalDifficulty?: string;
  parentHash: string;
  nonce: string;
  extraData: string;
}

export class MonadRpcService {
  private rpcUrl: string;

  constructor(rpcUrl: string = MONAD_RPC_URL) {
    this.rpcUrl = rpcUrl;
  }

  // Fetch latest block via HTTP
  async getLatestBlock(): Promise<MonadBlock | null> {
    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBlockByNumber',
          params: ['latest', true],
          id: 1,
        }),
      });
      const data = await response.json();
      if (data.result) {
        return this.formatBlock(data.result);
      }
      return null;
    } catch (error) {
      console.error('Error fetching latest block:', error);
      return null;
    }
  }

  // Fetch block by hash
  async getBlockByHash(blockHash: string): Promise<MonadBlock | null> {
    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBlockByHash',
          params: [blockHash, true],
          id: 1,
        }),
      });
      const data = await response.json();
      if (data.result) {
        return this.formatBlock(data.result);
      }
      return null;
    } catch (error) {
      console.error('Error fetching block by hash:', error);
      return null;
    }
  }

  // Fetch transaction by hash
  async getTransactionByHash(txHash: string): Promise<MonadTransaction | null> {
    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getTransactionByHash',
          params: [txHash],
          id: 1,
        }),
      });
      const data = await response.json();
      if (data.result) {
        return this.formatTransaction(data.result, Date.now() / 1000);
      }
      return null;
    } catch (error) {
      console.error('Error fetching transaction by hash:', error);
      return null;
    }
  }

  // Format raw block data
  private formatBlock(rawBlock: any): MonadBlock {
    return {
      number: parseInt(rawBlock.number, 16),
      hash: rawBlock.hash,
      timestamp: parseInt(rawBlock.timestamp, 16),
      gasUsed: rawBlock.gasUsed,
      gasLimit: rawBlock.gasLimit,
      miner: rawBlock.miner,
      difficulty: rawBlock.difficulty,
      totalDifficulty: rawBlock.totalDifficulty,
      parentHash: rawBlock.parentHash,
      nonce: rawBlock.nonce,
      extraData: rawBlock.extraData,
      transactions: rawBlock.transactions.map((tx: any) =>
        this.formatTransaction(tx, parseInt(rawBlock.timestamp, 16))
      )
    };
  }

  // Format and categorize transaction
  private formatTransaction(rawTx: any, blockTimestamp: number): MonadTransaction {
    const txType = this.categorizeTransaction(rawTx);
    return {
      hash: rawTx.hash,
      from: rawTx.from,
      to: rawTx.to,
      value: rawTx.value,
      gasPrice: rawTx.gasPrice || rawTx.maxFeePerGas,
      gasUsed: rawTx.gasUsed,
      blockNumber: parseInt(rawTx.blockNumber || '0x0', 16),
      blockHash: rawTx.blockHash,
      transactionIndex: parseInt(rawTx.transactionIndex || '0x0', 16),
      timestamp: blockTimestamp,
      input: rawTx.input,
      status: 1,
      type: txType,
      methodId: rawTx.input ? rawTx.input.substring(0, 10) : undefined
    };
  }

  // Transaction categorization logic (same as before)
  private categorizeTransaction(rawTx: any): string {
    if (!rawTx.to) return 'contract_deploy';
    const input = rawTx.input?.toLowerCase() || '';
    if (input === '0x' || input === '') return 'monad_transfer';
    if (input.startsWith('0x38ed1739')) return 'uniswap_swap';
    if (input.startsWith('0x7ff36ab5')) return 'uniswap_swap';
    if (input.startsWith('0x5c11d795')) return 'uniswap_swap';
    if (input.startsWith('0x414bf389')) return 'uniswap_swap';
    if (input.startsWith('0xe8e33700')) return 'defi_staking';
    if (input.startsWith('0xf305d719')) return 'defi_staking';
    if (input.startsWith('0xbaa2abde')) return 'defi_staking';
    if (input.startsWith('0xa0712d68')) return 'defi_lending';
    if (input.startsWith('0xdb006a75')) return 'defi_lending';
    if (input.startsWith('0xe9c714f2')) return 'defi_lending';
    if (input.startsWith('0x69328dec')) return 'defi_lending';
    if (input.startsWith('0x40c10f19')) return 'nft_mint';
    if (input.startsWith('0xa0712d68')) return 'nft_mint';
    if (input.startsWith('0x23b872dd')) return 'nft_transfer';
    if (input.startsWith('0x42842e0e')) return 'nft_transfer';
    return 'unknown';
  }

  // Ingredient and dish logic (same as before)
  public transactionToIngredient(tx: MonadTransaction): string {
    const type = tx.type || 'unknown';
    const ingredients = (ingredientTypes as Record<string, string[]>)[type] || (ingredientTypes as Record<string, string[]>)['unknown'] || ['🍅'];
    const idx = Math.floor(Math.random() * ingredients.length);
    return ingredients[idx];
  }

  public transactionsToDish(transactions: MonadTransaction[]): string {
    // If no transactions, return a simple dish
    if (transactions.length === 0) {
      return '🍽️';
    }
    
    // Count transaction types to determine the dominant type
    const typeCounts: Record<string, number> = {};
    transactions.forEach(tx => {
      typeCounts[tx.type] = (typeCounts[tx.type] || 0) + 1;
    });
    
    // Find the dominant transaction type
    const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
    const dominantType = sortedTypes[0][0];
    
    // Map transaction types to appropriate dish categories
    const dishMapping: Record<string, string[]> = {
      'monad_transfer': ['🍕', '🍔', '🥞', '🍞', '🥖'], // Simple dishes for transfers
      'contract_deploy': ['🥘', '🍲', '🍛', '🫕', '🍱'], // Complex dishes for deployments
      'uniswap_swap': ['🍜', '🥘', '🍲', '🍣', '🍤'], // Liquid/mixed dishes for swaps
      'defi_staking': ['🍮', '🍯', '🍦', '🍨', '🍧'], // Sweet/creamy dishes for staking
      'defi_lending': ['🍛', '🥗', '🍝', '🥙', '🌮'], // Complex dishes for lending
      'nft_mint': ['🍰', '🎂', '🧁', '🍪', '🍩'], // Sweet/fancy dishes for NFT mints
      'nft_transfer': ['🍬', '🍭', '🍫', '🍩', '🍪'], // Sweet treats for NFT transfers
      'unknown': COOKED_DISH_EMOJIS // Fall back to random dish for unknown types
    };
    
    // Select a dish based on dominant transaction type
    const dishOptions = dishMapping[dominantType] || COOKED_DISH_EMOJIS;
    const idx = Math.floor(Math.random() * dishOptions.length);
    return dishOptions[idx];
  }
}

// Singleton instance
export const monadService = new MonadRpcService(MONAD_RPC_URL);