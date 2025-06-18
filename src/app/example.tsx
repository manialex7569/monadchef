'use client';

import { useAlchemyData } from '@/hooks/useMonadData';
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
    completedDishes, 
    stats,
    reconnect,
    network,
    blockTime
  } = useAlchemyData();

  const [flyingIngredients, setFlyingIngredients] = useState<FlyingIngredient[]>([]);
  const [flyingDish, setFlyingDish] = useState<FlyingDish | null>(null);
  const [lastProcessedBlock, setLastProcessedBlock] = useState<number>(0);
  const [panIngredients, setPanIngredients] = useState<string[]>([]);

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

  // Handle completed dishes with right hand animation
  useEffect(() => {
    if (completedDishes.length > 0) {
      const latestDish = completedDishes[0];
      
      if (latestDish.blockNumber > lastProcessedBlock) {
        console.log(`🍳 NEW DISH: Block ${latestDish.blockNumber} completed!`);
        
        setLastProcessedBlock(latestDish.blockNumber);
        
        // Clear pan ingredients and create flying dish
        setTimeout(() => {
          setPanIngredients([]);
          setFlyingDish({
            id: `${latestDish.blockNumber}-${Date.now()}`,
            dishEmoji: latestDish.dishEmoji,
            blockNumber: latestDish.blockNumber
          });
        }, 800); // Match the new dish animation duration
      }
    }
  }, [completedDishes, lastProcessedBlock]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍳</div>
          <div className="text-xl font-semibold text-gray-700 mb-2">Connecting to {network}...</div>
          <div className="text-gray-500">Preparing the ultra-fast kitchen for {blockTime}ms blocks!</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-xl font-semibold text-red-700 mb-2">Connection Failed</div>
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={reconnect}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2B185A] to-[#fff]">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-4xl font-extrabold mb-2 tracking-tight" style={{color: '#2B185A'}}>
          <span className="text-[#F9D923]">🍳</span> Monad <span className="text-[#F9D923]">Chef</span>
        </h1>
        <p className="text-lg mb-4 font-medium" style={{color: '#2B185A'}}>
          The ultra-fast Monad blockchain kitchen
        </p>
        
        {/* Connection Status */}
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
            isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
            Block #{stats.currentBlockNumber.toLocaleString()}
          </div>
          <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
            {stats.tps.toFixed(1)} TPS
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Top-View Cooking Area */}
          <div className="lg:col-span-2 relative h-96 bg-gradient-to-br from-[#fff] to-[#2B185A]/10 rounded-3xl shadow-2xl overflow-hidden border-4 border-[#2B185A]">
            
            {/* Cooking Surface (Top View) */}
            <div className="absolute inset-0">
              
              {/* Central Cooking Pan (Top View) */}
              <div 
                className="absolute rounded-full bg-gradient-to-br from-[#2B185A] to-[#fff] border-8 border-[#2B185A] shadow-2xl"
                style={{
                  left: COOKING_AREA_CONFIG.panCenterX - COOKING_AREA_CONFIG.panWidth / 2,
                  top: COOKING_AREA_CONFIG.panCenterY - COOKING_AREA_CONFIG.panHeight / 2,
                  width: COOKING_AREA_CONFIG.panWidth,
                  height: COOKING_AREA_CONFIG.panHeight
                }}
              >
                {/* Pan Interior */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#fff] to-[#F9D923]/40 flex items-center justify-center">
                  
                  {/* Pan Ingredients */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    {panIngredients.slice(-12).map((ingredient, index) => (
                      <motion.div
                        key={`pan-${index}-${ingredient}`}
                        initial={{ scale: 0, rotate: 0 }}
                        animate={{ 
                          scale: 1, 
                          rotate: Math.random() * 360,
                          x: (Math.random() - 0.5) * 60,
                          y: (Math.random() - 0.5) * 60
                        }}
                        className="absolute text-2xl"
                      >
                        {ingredient}
                      </motion.div>
                    ))}
                    
                    {/* Pan Status */}
                    {panIngredients.length === 0 && (
                      <div className="text-3xl opacity-50">🥘</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Flying Ingredients */}
              <AnimatePresence>
                {flyingIngredients.map((ingredient) => (
                  <motion.div
                    key={ingredient.id}
                    initial={{
                      x: ingredient.startX,
                      y: ingredient.startY,
                      scale: 0,
                      rotate: 0,
                      opacity: 0
                    }}
                    animate={{
                      x: COOKING_AREA_CONFIG.panCenterX,
                      y: COOKING_AREA_CONFIG.panCenterY,
                      scale: [0, 1.3, 1],
                      rotate: [0, 180, 360],
                      opacity: [0, 1, 1]
                    }}
                    transition={{
                      duration: ANIMATION_CONFIG.ingredientFlightDuration / 1000,
                      ease: "easeOut"
                    }}
                    className="absolute z-20"
                  >
                    <div className="text-3xl drop-shadow-lg">
                      {ingredient.emoji}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Flying Dish */}
              <AnimatePresence>
                {flyingDish && (
                  <motion.div
                    key={flyingDish.id}
                    initial={{
                      x: COOKING_AREA_CONFIG.panCenterX,
                      y: COOKING_AREA_CONFIG.panCenterY,
                      scale: 1.5,
                      rotate: 0,
                      opacity: 1
                    }}
                    animate={{
                      x: COOKING_AREA_CONFIG.dishDestinationX,
                      y: COOKING_AREA_CONFIG.dishDestinationY,
                      scale: [1.5, 1.8, 1.2],
                      rotate: [0, 15, -15, 0],
                      opacity: [1, 1, 0.8, 0]
                    }}
                    transition={{
                      duration: 0.8,
                      ease: "easeOut"
                    }}
                    className="absolute z-25"
                  >
                    <div className="text-6xl drop-shadow-lg">
                      {flyingDish.dishEmoji}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Recent Dishes Panel */}
          <div className="bg-white rounded-3xl shadow-xl p-7 border-2 border-[#2B185A]">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-2xl">🍽️</div>
              <h2 className="text-xl font-bold text-[#2B185A]">Completed Dishes</h2>
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {completedDishes
                .filter((dish, index, arr) => 
                  arr.findIndex(d => d.blockNumber === dish.blockNumber) === index
                )
                .slice(0, 15)
                .map((dish) => (
                  <motion.div
                    key={`${dish.blockNumber}-${dish.timestamp}`}
                    initial={{ opacity: 0, x: 20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    className="bg-gradient-to-r from-[#fff] to-[#F9D923]/10 rounded-xl p-4 border border-[#2B185A] hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{dish.dishEmoji}</div>
                        <div>
                          <div className="font-semibold text-[#2B185A]">
                            Dish #{dish.blockNumber.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(dish.timestamp * 1000).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-[#F9D923]">
                          {dish.transactions.length} ingredients
                        </div>
                        <div className="text-xs text-gray-500">
                          {(dish.transactions.length / (blockTime / 1000)).toFixed(1)} TPS
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
            
            {completedDishes.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">⏳</div>
                <div>Waiting for dishes...</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
