'use client';

import { motion } from 'framer-motion';

export interface IngredientType {
  name: string;
  color: string;
  emoji: string;
}

export interface IngredientProps {
  id: string;
  type: IngredientType;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  onComplete: () => void;
}

export default function Ingredient({ 
  id, 
  type, 
  startX, 
  startY, 
  targetX, 
  targetY, 
  onComplete 
}: IngredientProps) {
  return (
    <motion.div
      key={id}
      initial={{
        x: startX,
        y: startY,
        scale: 0,
        rotate: 0
      }}
      animate={{
        x: targetX,
        y: targetY,
        scale: [0, 1.2, 0.8],
        rotate: 360
      }}
      exit={{ scale: 0 }}
      transition={{
        duration: 2,
        ease: "easeInOut"
      }}
      onAnimationComplete={onComplete}
      className="absolute z-10"
    >
      <div className="text-2xl drop-shadow-lg">
        {type.emoji}
      </div>
    </motion.div>
  );
} 