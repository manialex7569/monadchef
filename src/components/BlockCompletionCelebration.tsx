'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface BlockCompletionCelebrationProps {
  trigger: number; // blocks completed count to trigger animation
}

export default function BlockCompletionCelebration({ trigger }: BlockCompletionCelebrationProps) {
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (trigger > 0) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1500); // Shorter duration
    }
  }, [trigger]);

  const celebrationEmojis = ['🎉', '🍽️', '✨', '🏆', '👨‍🍳'];

  return (
    <AnimatePresence>
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="fixed top-4 right-4 pointer-events-none z-50"
        >
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-2xl shadow-2xl text-center"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 0.5,
                repeat: 2
              }}
              className="text-2xl font-bold mb-2"
            >
              Block #{trigger} Completed! 🎉
            </motion.div>
            <div className="flex justify-center gap-2 text-lg">
              {celebrationEmojis.map((emoji, index) => (
                <motion.span
                  key={index}
                  initial={{ y: 0 }}
                  animate={{ y: [-10, 0, -5, 0] }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.5,
                    repeat: 1
                  }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 