import { useState, useEffect, useCallback } from 'react';
import { monadService, MonadTransaction, MonadBlock } from '@/lib/blockchain';

export interface RealTimeStats {
  currentBlockNumber: number;
  totalTransactions: number;
  avgBlockTime: number;
  networkHashrate: string;
  gasPrice: string;
  tps: number;
  network: string;
  isConnected: boolean;
  blocksPerMinute: number;
}

export interface CookingIngredient {
  id: string;
  emoji: string;
  txHash: string;
  txType: string;
  from: string;
  to: string | null;
  value: string;
  timestamp: number;
  methodId?: string;
  gasPrice?: string;
}

export interface CookingDish {
  id: string;
  dishEmoji: string;
  blockNumber: number;
  blockHash: string;
  transactions: CookingIngredient[];
  timestamp: number;
  gasUsed: string;
  miner: string;
  difficulty: string;
  transactionCount: number;
}

export function useMonadData() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Real-time data
  const [currentIngredients, setCurrentIngredients] = useState<CookingIngredient[]>([]);
  const [completedDishes, setCompletedDishes] = useState<CookingDish[]>([]);
  const [stats, setStats] = useState<RealTimeStats>({
    currentBlockNumber: 0,
    totalTransactions: 0,
    avgBlockTime: 500, // Monad's lightning-fast block time
    networkHashrate: '0',
    gasPrice: '1', // Monad has very low gas prices
    tps: 0,
    network: 'Monad Testnet',
    isConnected: false,
    blocksPerMinute: 120 // 500ms blocks = 120 blocks per minute
  });

  // Block timing tracking for TPS calculation
  const [recentBlocks, setRecentBlocks] = useState<{ number: number; timestamp: number; txCount: number }[]>([]);

  // Convert blockchain transaction to cooking ingredient
  const transactionToIngredient = useCallback((tx: MonadTransaction): CookingIngredient => {
    return {
      id: tx.hash,
      emoji: monadService.transactionToIngredient(tx),
      txHash: tx.hash,
      txType: tx.type,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      timestamp: tx.timestamp,
      methodId: tx.methodId,
      gasPrice: tx.gasPrice
    };
  }, []);

  // Convert blockchain block to cooking dish
  const blockToDish = useCallback((block: MonadBlock): CookingDish => {
    const ingredients = block.transactions.map(transactionToIngredient);
    
    return {
      id: block.hash,
      dishEmoji: monadService.transactionsToDish(block.transactions),
      blockNumber: block.number,
      blockHash: block.hash,
      transactions: ingredients,
      timestamp: block.timestamp,
      gasUsed: block.gasUsed,
      miner: block.miner,
      difficulty: block.difficulty,
      transactionCount: block.transactions.length
    };
  }, [transactionToIngredient]);

  // Calculate real-time TPS from recent blocks
  const calculateTPS = useCallback((blocks: { number: number; timestamp: number; txCount: number }[]) => {
    if (blocks.length < 2) return 0;
    
    const sortedBlocks = blocks.sort((a, b) => b.timestamp - a.timestamp);
    const recentBlocks = sortedBlocks.slice(0, 10); // Last 10 blocks
    
    if (recentBlocks.length < 2) return 0;
    
    const totalTxs = recentBlocks.reduce((sum, block) => sum + block.txCount, 0);
    const timeSpan = recentBlocks[0].timestamp - recentBlocks[recentBlocks.length - 1].timestamp;
    
    return timeSpan > 0 ? totalTxs / timeSpan : 0;
  }, []);

  // Initialize POLLING connection (no WebSocket!)
  const initializeConnection = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🚀 Initializing Monad Testnet connection (POLLING MODE)...');
      
      // NO WebSocket - just fetch latest block to get current state
      const latestBlock = await monadService.getLatestBlock();
      if (!latestBlock) {
        throw new Error('Failed to fetch latest block from Monad Testnet');
      }

      console.log(`⚡ Monad block #${latestBlock.number} with ${latestBlock.transactions.length} transactions (POLLING every 500ms)`);

      // Initialize recent blocks tracking
      setRecentBlocks([{
        number: latestBlock.number,
        timestamp: latestBlock.timestamp,
        txCount: latestBlock.transactions.length
      }]);

      // Update stats with initial data
      setStats(prev => ({
        ...prev,
        currentBlockNumber: latestBlock.number,
        totalTransactions: latestBlock.transactions.length,
        avgBlockTime: 500,
        network: 'Monad Testnet',
        tps: latestBlock.transactions.length / 0.5, // Approximate initial TPS
        blocksPerMinute: 120,
        isConnected: true
      }));

      // Convert latest block to dish for initial display
      const initialDish = blockToDish(latestBlock);
      setCompletedDishes([initialDish]);

      setIsConnected(true);
      console.log('✅ Monad Testnet POLLING connection established successfully!');
      console.log('⚡ Ultra-fast 500ms block times - polling every 500ms!');

    } catch (err) {
      console.error('❌ Error initializing Monad connection:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to Monad Testnet');
      setIsConnected(false);
      setStats(prev => ({ ...prev, isConnected: false }));
    } finally {
      setIsLoading(false);
    }
  }, [blockToDish]);

  // Set up POLLING for new blocks (no WebSocket!)
  const setupPolling = useCallback(() => {
    if (!isConnected) return;

    console.log('🔄 Setting up Monad ULTRA-FAST POLLING for 500ms blocks...');

    let lastBlockNumber = stats.currentBlockNumber;
    let pollingInterval: NodeJS.Timeout;

    const pollForNewBlocks = async () => {
      try {
        const latestBlock = await monadService.getLatestBlock();
        if (!latestBlock) return;

        // Check if we have new blocks (could be multiple blocks since last poll)
        if (latestBlock.number > lastBlockNumber) {
          const blockDifference = latestBlock.number - lastBlockNumber;
          console.log(`🚀 MONAD BURST: ${blockDifference} new blocks detected! Latest: #${latestBlock.number}`);
          
          // If we missed multiple blocks, we need to fetch them all
          if (blockDifference > 1) {
            console.log(`⚡ CATCHING UP: Fetching ${blockDifference} missed blocks...`);
            
            // Fetch all missed blocks in parallel for better performance
            const missedBlockPromises = [];
            for (let blockNum = lastBlockNumber + 1; blockNum <= latestBlock.number; blockNum++) {
              if (blockNum < latestBlock.number) {
                missedBlockPromises.push(
                  monadService.getLatestBlock().then(block => {
                    if (block && block.number === blockNum) return block;
                    return null;
                  })
                );
              }
            }
            
            // Process missed blocks
            const missedBlocks = await Promise.all(missedBlockPromises);
            missedBlocks.forEach(block => {
              if (block && block.transactions.length > 0) {
                console.log(`📦 Processing missed block #${block.number} with ${block.transactions.length} txs`);
                const blockIngredients = block.transactions.map(tx => transactionToIngredient(tx));
                setCurrentIngredients(prev => [...prev, ...blockIngredients]);
                
                // Add to completed dishes
                const dish = blockToDish(block);
                setCompletedDishes(prev => [dish, ...prev.slice(0, 49)]); // Keep last 50 dishes
              }
            });
          }
          
          // Process the latest block
          if (latestBlock.transactions.length > 0) {
            console.log(`🍳 Processing latest block #${latestBlock.number} with ${latestBlock.transactions.length} txs`);
            const blockIngredients = latestBlock.transactions.map(tx => transactionToIngredient(tx));
            setCurrentIngredients(prev => {
              const recentIngredients = prev.slice(-20);
              return [...recentIngredients, ...blockIngredients];
            });
            
            // Add latest block to completed dishes
            const latestDish = blockToDish(latestBlock);
            setCompletedDishes(prev => [latestDish, ...prev.slice(0, 49)]); // Keep last 50 dishes
          }
          
          // Update recent blocks tracking
          setRecentBlocks(prev => {
            const newBlockData = {
              number: latestBlock.number,
              timestamp: latestBlock.timestamp,
              txCount: latestBlock.transactions.length
            };
            const updatedBlocks = [newBlockData, ...prev.slice(0, 19)]; // Keep last 20 blocks
            return updatedBlocks;
          });
          
          // Calculate and update TPS
          setRecentBlocks(currentBlocks => {
            const tps = calculateTPS(currentBlocks);
            setStats(prev => ({
              ...prev,
              currentBlockNumber: latestBlock.number,
              totalTransactions: prev.totalTransactions + latestBlock.transactions.length,
              tps: tps,
              avgBlockTime: currentBlocks.length > 1 ? 
                (currentBlocks[0].timestamp - currentBlocks[currentBlocks.length - 1].timestamp) / (currentBlocks.length - 1) * 1000 : 
                500 // Default to Monad's 500ms
            }));
            return currentBlocks;
          });
        }
      } catch (error) {
        console.error('❌ Error polling for new blocks:', error);
      }
    };

    pollForNewBlocks();
    pollingInterval = setInterval(pollForNewBlocks, 250);

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        console.log('🛑 Stopped Monad polling');
      }
    };
  }, [isConnected, stats.currentBlockNumber, transactionToIngredient, blockToDish, calculateTPS]);

  useEffect(() => {
    initializeConnection();
  }, [initializeConnection]);

  useEffect(() => {
    if (isConnected) {
      const cleanup = setupPolling();
      return cleanup;
    }
  }, [isConnected, setupPolling]);

  useEffect(() => {
    if (currentIngredients.length === 0) return;

    const cleanup = setInterval(() => {
      const now = Date.now() / 1000;
      setCurrentIngredients(prev => 
        prev.filter(ingredient => (now - ingredient.timestamp) < 15)
      );
    }, 2000);

    return () => clearInterval(cleanup);
  }, [currentIngredients.length]);

  useEffect(() => {
    if (recentBlocks.length < 2) return;

    const newTPS = calculateTPS(recentBlocks);
    if (newTPS > 0) {
      setStats(prev => ({
        ...prev,
        tps: newTPS
      }));
    }
  }, [recentBlocks, calculateTPS]);

  const reconnect = useCallback(async () => {
    console.log('🔄 Manual Monad reconnection requested...');
    setIsConnected(false);
    setError(null);
    setRecentBlocks([]);
    await initializeConnection();
  }, [initializeConnection]);

  return {
    isConnected,
    isLoading,
    error,
    currentIngredients,
    completedDishes,
    stats,
    reconnect,
    network: 'Monad Testnet',
    blockTime: 500,
    networkConfig: { name: 'Monad Testnet', blockTime: 500 },
  };
}