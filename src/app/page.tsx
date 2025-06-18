'use client';

import { useMonadData, CookingDish } from '@/hooks/useMonadData';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { COOKING_AREA_CONFIG, ANIMATION_CONFIG, HAND_STATES } from '@/components/constants';

interface FlyingIngredient {
  id: string;
  emoji: string;
  startX: number;
  startY: number;
  txHash: string;
  delay?: number;
}

interface FlyingDish {
  id: string;
  dishEmoji: string;
  blockNumber: number;
}

interface HandState {
  left: keyof typeof HAND_STATES;
  right: keyof typeof HAND_STATES;
}

export default function Home() {
  const { 
    isConnected, 
    isLoading, 
    error, 
    currentIngredients, 
    completedDishes: fetchedDishes, 
    stats,
    reconnect,
    network,
    blockTime
  } = useMonadData();

  const [flyingIngredients, setFlyingIngredients] = useState<FlyingIngredient[]>([]);
  const [flyingDish, setFlyingDish] = useState<FlyingDish | null>(null);
  const [lastProcessedBlock, setLastProcessedBlock] = useState<number>(0);
  const [panIngredients, setPanIngredients] = useState<string[]>([]);
  const [selectedDish, setSelectedDish] = useState<CookingDish | null>(null);

  // Queue for blocks to animate
  const [dishQueue, setDishQueue] = useState<CookingDish[]>([]);
  // Local completed dishes state for UI sync (only after animation)
  const [completedDishes, setCompletedDishes] = useState<CookingDish[]>([]);
  // Track which blockNumbers have already been animated
  const [animatedBlocks, setAnimatedBlocks] = useState<Set<number>>(new Set());

  // Enhanced ingredient processing for Monad's ultra-fast blocks with hand animations
  useEffect(() => {
    const newIngredients = currentIngredients
      .filter(ingredient => !flyingIngredients.some(fi => fi.txHash === ingredient.txHash))
      .slice(0, ANIMATION_CONFIG.ingredientsPerBatch) // Use config for batch size
      .map((ingredient, index) => ({
        id: `${ingredient.txHash}-${Date.now()}-${index}`,
        emoji: ingredient.emoji,
        startX: Math.random() * (COOKING_AREA_CONFIG.ingredientSpawnMaxX - COOKING_AREA_CONFIG.ingredientSpawnMinX) + COOKING_AREA_CONFIG.ingredientSpawnMinX,
        startY: Math.random() * (COOKING_AREA_CONFIG.ingredientSpawnMaxY - COOKING_AREA_CONFIG.ingredientSpawnMinY) + COOKING_AREA_CONFIG.ingredientSpawnMinY,
        txHash: ingredient.txHash,
        delay: index * ANIMATION_CONFIG.staggerDelay
      }));

    if (newIngredients.length > 0) {
      // Add ingredients with staggered timing
      newIngredients.forEach(ingredient => {
        setTimeout(() => {
          setFlyingIngredients(prev => [...prev, ingredient]);
        }, ingredient.delay);
      });

      // Add ingredients to pan when they reach it
      newIngredients.forEach(ingredient => {
        setTimeout(() => {
          setPanIngredients(prev => [...prev, ingredient.emoji]);
          setFlyingIngredients(prev => prev.filter(fi => fi.id !== ingredient.id));
        }, ANIMATION_CONFIG.ingredientFlightDuration + ingredient.delay);
      });
    }
  }, [currentIngredients]);

  // Keep dishQueue in sync with fetchedDishes (add new blocks to queue)
  useEffect(() => {
    if (fetchedDishes.length > 0) {
      // Find all blocks in fetchedDishes not in queue, completedDishes, or already animated
      const knownBlockNumbers = new Set([
        ...dishQueue.map(d => d.blockNumber),
        ...completedDishes.map(d => d.blockNumber),
        ...Array.from(animatedBlocks)
      ]);
      
      // Only add dishes that haven't been processed yet
      const newDishes = fetchedDishes.filter(d => !knownBlockNumbers.has(d.blockNumber));
      
      if (newDishes.length > 0) {
        console.log(`Adding ${newDishes.length} new dishes to animation queue`);
        setDishQueue(prev => [...prev, ...newDishes]);
      }
    }
  }, [fetchedDishes, dishQueue, completedDishes, animatedBlocks]);

  // Animate the first dish in the queue if not already animating
  useEffect(() => {
    // Only trigger animation if not already animating and queue has dishes
    if (dishQueue.length > 0 && !flyingDish) {
      const nextDish = dishQueue[0];
      // Use a ref to track if we've already started animating this dish
      const animationTimeoutId = setTimeout(() => {
        setPanIngredients([]);
        setFlyingDish({
          id: `${nextDish.blockNumber}-${Date.now()}`,
          dishEmoji: nextDish.dishEmoji,
          blockNumber: nextDish.blockNumber
        });
      }, 400); // Faster delay
      
      // Clean up timeout if component unmounts or dependencies change
      return () => clearTimeout(animationTimeoutId);
    }
  }, [dishQueue, flyingDish]);

  // When the flying dish animation completes, add to completed dishes panel and dequeue
  const handleDishAnimationComplete = () => {
    if (dishQueue.length > 0) {
      const finishedDish = dishQueue[0];
      // First update the animatedBlocks to prevent re-animation
      setAnimatedBlocks(prev => {
        const newSet = new Set(prev);
        newSet.add(finishedDish.blockNumber);
        return newSet;
      });
      // Then update the UI state
      setCompletedDishes(prev => [finishedDish, ...prev].slice(0, 50));
      setDishQueue(prev => prev.slice(1));
    }
    // Always clear the flying dish at the end
    setFlyingDish(null);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a103d] to-[#3d1a56] flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-[#5d35aa]/30">
          <div className="text-7xl mb-6 animate-bounce">🍳</div>
          <div className="text-2xl font-semibold text-blue-200 mb-3">Connecting to MonadChef...</div>
          <div className="text-lg text-blue-200/80">
            Preparing the ultra-fast kitchen for {blockTime}ms blocks!
          </div>
          <div className="mt-8 flex justify-center">
            <div className="w-3 h-3 bg-blue-400/60 rounded-full animate-pulse mx-1"></div>
            <div className="w-3 h-3 bg-blue-400/60 rounded-full animate-pulse mx-1 delay-150"></div>
            <div className="w-3 h-3 bg-blue-400/60 rounded-full animate-pulse mx-1 delay-300"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a103d] to-[#3d1a56] flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-red-500/30 max-w-md">
          <div className="text-7xl mb-6">⚠️</div>
          <div className="text-2xl font-semibold text-red-300 mb-3">Connection Failed</div>
          <div className="text-red-200/80 mb-8">{error}</div>
          <button 
            onClick={reconnect}
            className="bg-red-500/20 text-red-300 border border-red-500/30 px-6 py-3 rounded-xl hover:bg-red-500/30 transition-all backdrop-blur-md font-medium"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a103d] to-[#3d1a56] text-white">
      {/* Header with Glassmorphism */}
      <div className="backdrop-blur-md bg-white/10 py-6 px-4 shadow-lg mb-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <div className="flex items-center gap-3">
                <img src="/monad-chef-logo.svg" alt="Monad Chef Logo" className="w-12 h-12" />
                <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#F9D923] to-[#ff9500]">
                  Monad <span className="text-white">Chef</span>
                </h1>
              </div>
              <p className="text-lg font-medium text-blue-200">
                Ultra-fast blockchain kitchen • {blockTime}ms blocks
              </p>
            </div>
            
            {/* Stats Dashboard */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md ${
                isConnected ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                <div className={`w-3 h-3 rounded-full animate-pulse ${
                  isConnected ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <span className="font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              
              <div className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-4 py-2 rounded-xl backdrop-blur-md flex items-center gap-2">
                <span className="text-lg">⛓️</span>
                <div>
                  <div className="font-medium">Block #{stats.currentBlockNumber.toLocaleString()}</div>
                  <div className="text-xs opacity-80">{new Date().toLocaleTimeString()}</div>
                </div>
              </div>
              
              <div className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-4 py-2 rounded-xl backdrop-blur-md flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <div>
                  <div className="font-medium">{stats.tps.toFixed(1)} TPS</div>
                  <div className="text-xs opacity-80">{stats.blocksPerMinute} blocks/min</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Top-View Cooking Area */}
          <div className="lg:col-span-2 relative h-[450px] bg-gradient-to-br from-[#2a1b4a]/90 to-[#3d1a56]/90 rounded-3xl shadow-2xl overflow-hidden border border-[#5d35aa]/50 backdrop-blur-sm">
            
            {/* Kitchen background elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 left-4 w-20 h-20 rounded-lg bg-blue-400/30"></div>
              <div className="absolute top-4 right-4 w-16 h-16 rounded-lg bg-purple-400/30"></div>
              <div className="absolute bottom-4 left-4 w-24 h-12 rounded-lg bg-yellow-400/30"></div>
              <div className="absolute bottom-4 right-4 w-16 h-20 rounded-lg bg-green-400/30"></div>
            </div>
            
            {/* Kitchen title */}
            <div className="absolute top-4 left-6 flex items-center">
              <span className="text-lg text-blue-200 font-medium">Monad Kitchen</span>
              <div className="ml-3 px-2 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-md text-xs">
                {stats.tps.toFixed(1)} TPS
              </div>
            </div>
            
            {/* Cooking Surface (Top View) */}
            <div className="absolute inset-0 flex items-center justify-center">
              
              {/* Central Cooking Pan (Top View) */}
              <div 
                className="relative rounded-full bg-gradient-to-br from-[#2B185A] to-[#4c2a8c] border-8 border-[#5d35aa] shadow-[0_0_30px_rgba(93,53,170,0.5)] w-[220px] h-[220px]"
              >
                {/* Pan Interior */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#1a103d] to-[#3d1a56] flex items-center justify-center overflow-hidden">
                  {/* Animated glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#F9D923]/0 via-[#F9D923]/30 to-[#F9D923]/0 animate-pulse"></div>
                  
                  {/* Pan Ingredients */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    {panIngredients.slice(-12).map((ingredient, index) => (
                      <motion.div
                        key={`pan-${index}-${ingredient}`}
                        initial={{ scale: 0, rotate: 0 }}
                        animate={{ 
                          scale: 1, 
                          rotate: Math.random() * 360,
                          x: (Math.random() - 0.5) * 70,
                          y: (Math.random() - 0.5) * 70
                        }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="absolute text-3xl drop-shadow-lg"
                      >
                        {ingredient}
                      </motion.div>
                    ))}
                    
                    {/* Pan Status */}
                    {panIngredients.length === 0 && (
                      <div className="text-4xl opacity-50 animate-pulse">🥘</div>
                    )}
                  </div>
                </div>
                
                {/* Pan rim highlights */}
                <div className="absolute top-0 left-1/4 right-1/4 h-2 bg-white/20 rounded-full"></div>
              </div>

              {/* Flying Ingredients */}
              <AnimatePresence>
                {flyingIngredients.map((ingredient) => (
                  <motion.div
                    key={ingredient.id}
                    initial={{
                      x: -400,
                      y: 200 + Math.random() * 100 - 50,
                      scale: 0,
                      rotate: 0,
                      opacity: 0
                    }}
                    animate={{
                      x: 0,
                      y: 0,
                      scale: [0, 1.5, 1],
                      rotate: [0, 180, 360],
                      opacity: [0, 1, 1]
                    }}
                    transition={{
                      duration: ANIMATION_CONFIG.ingredientFlightDuration / 1000,
                      ease: "easeOut"
                    }}
                    className="absolute z-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    <div className="text-4xl drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]">
                      {ingredient.emoji}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Flying Dish */}
              <AnimatePresence mode="wait">
                {flyingDish && (
                  <motion.div
                    key={`dish-${flyingDish.id}-${flyingDish.blockNumber}`}
                    initial={{
                      x: 0,
                      y: 0,
                      scale: 1.5,
                      rotate: 0,
                      opacity: 1
                    }}
                    animate={{
                      x: [0, COOKING_AREA_CONFIG.dishDestinationX - 400],
                      y: [0, COOKING_AREA_CONFIG.dishDestinationY - 200],
                      scale: [1.5, 2, 1.2],
                      rotate: [0, 15, -15, 0],
                      opacity: [1, 1, 0.8, 0]
                    }}
                    transition={{
                      duration: 0.8,
                      ease: "easeOut"
                    }}
                    className="absolute z-30 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    onAnimationComplete={handleDishAnimationComplete}
                  >
                    <div className="text-7xl drop-shadow-[0_0_15px_rgba(255,215,0,0.7)]">
                      {flyingDish.dishEmoji}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Transaction stats */}
            <div className="absolute bottom-4 left-6 right-6 flex justify-between">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                <div className="text-xs text-blue-200 mb-1">Pending Transactions</div>
                <div className="font-bold text-lg text-white">{currentIngredients.length}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                <div className="text-xs text-blue-200 mb-1">Block Time</div>
                <div className="font-bold text-lg text-white">{blockTime}ms</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                <div className="text-xs text-blue-200 mb-1">Total Dishes</div>
                <div className="font-bold text-lg text-white">{completedDishes.length}</div>
              </div>
            </div>
          </div>

          {/* Recent Dishes Panel */}
          <div className="bg-[#2a1b4a]/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-[#5d35aa]/50">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🍽️</div>
                <h2 className="text-xl font-bold text-white">Completed Dishes</h2>
              </div>
              <div className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-lg text-xs">
                {completedDishes.length} total
              </div>
            </div>
            
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {completedDishes
                .filter((dish, index, arr) => 
                  arr.findIndex(d => d.blockNumber === dish.blockNumber) === index
                )
                .slice(0, 15)
                .map((dish) => (
                  <motion.div
                    key={`${dish.blockNumber}-${dish.timestamp}`}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 100 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-[#5d35aa]/30 hover:border-[#F9D923]/50 hover:bg-white/15 transition-all cursor-pointer group"
                    onClick={() => setSelectedDish(dish)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl group-hover:scale-110 transition-transform">
                          {dish.dishEmoji}
                        </div>
                        <div>
                          <div className="font-semibold text-white">
                            Dish #{dish.blockNumber.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-[#F9D923]">
                          {dish.transactions.length} ingredients
                        </div>
                        <div className="text-xs text-blue-200">
                          {(dish.transactions.length / (blockTime / 1000)).toFixed(1)} TPS
                        </div>
                      </div>
                    </div>
                    
                    {/* Ingredient preview */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {dish.transactions.slice(0, 5).map((tx, i) => (
                        <span key={`${tx.id}-${i}`} className="text-lg">{tx.emoji}</span>
                      ))}
                      {dish.transactions.length > 5 && (
                        <span className="text-xs bg-white/20 rounded-full px-2 py-1 text-white">
                          +{dish.transactions.length - 5} more
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>
            
            {completedDishes.length === 0 && (
              <div className="text-center text-blue-200 py-8">
                <div className="text-4xl mb-2 animate-pulse">⏳</div>
                <div>Waiting for dishes...</div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>

      {selectedDish && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-[#2a1b4a] rounded-2xl shadow-2xl p-6 md:p-8 max-w-2xl w-full relative border border-[#5d35aa]/50 text-white my-4"
          >
            <button 
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-xl transition-colors" 
              onClick={() => setSelectedDish(null)}
            >
              ×
            </button>
            
            <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 mb-6">
              <div className="flex flex-col items-center">
                <div className="text-6xl md:text-7xl mb-3 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" title={`Dish for block #${selectedDish.blockNumber}`}>
                  {selectedDish.dishEmoji}
                </div>
                <div className="bg-[#F9D923]/20 text-[#F9D923] px-3 py-1 rounded-lg text-sm font-medium">
                  {selectedDish.transactions.length} ingredients
                </div>
              </div>
              
              <div className="flex-1 w-full">
                <h3 className="font-bold text-xl md:text-2xl text-white mb-2">Dish #{selectedDish.blockNumber.toLocaleString()}</h3>
                
                <div className="mb-4">
                  <div className="bg-white/10 rounded-lg p-3 border border-white/10">
                    <div className="text-xs text-blue-200 mb-1">Performance</div>
                    <div className="font-medium">{(selectedDish.transactions.length / (blockTime / 1000)).toFixed(1)} TPS</div>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-3 border border-white/10 mb-3">
                  <div className="text-xs text-blue-200 mb-1">Ingredients</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Array.from(new Set(selectedDish.transactions.map(tx => tx.emoji))).map((emoji, i) => (
                      <div key={i} className="text-xl">
                        {emoji}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-lg text-white">Ingredients</h4>
              <div className="text-sm text-blue-200">
                {selectedDish.transactions.length} total
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar mb-4">
              {selectedDish.transactions.map((tx, idx) => (
                <motion.div 
                  key={tx.txHash} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.03, 1) }}
                  className="flex items-center gap-3 text-sm bg-white/10 hover:bg-white/15 rounded-lg p-3 border border-white/10 transition-colors"
                >
                  <span className="text-2xl">{tx.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-xs text-white/80 truncate">
                      {tx.txHash}
                    </div>
                  </div>
                  <button
                    className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs transition-colors shrink-0"
                    onClick={() => navigator.clipboard.writeText(tx.txHash)}
                    title="Copy transaction hash"
                  >
                    Copy
                  </button>
                </motion.div>
              ))}
            </div>
            
            <div className="bg-white/10 rounded-lg p-3 border border-white/10">
              <div className="text-xs text-blue-200 mb-1">Block Hash</div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs md:text-sm select-all truncate max-w-full">
                  {selectedDish.blockHash}
                </span>
                <button
                  className="ml-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs transition-colors shrink-0"
                  onClick={() => navigator.clipboard.writeText(selectedDish.blockHash)}
                  title="Copy block hash"
                >
                  Copy
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
