'use client';

import { motion } from 'framer-motion';

interface SoundWavesProps {
  isActive: boolean;
}

export default function SoundWaves({ isActive }: SoundWavesProps) {
  if (!isActive) return null;

  return (
    <div className="absolute top-4 left-4 flex items-center gap-1">
      {[1, 2, 3].map((index) => (
        <motion.div
          key={index}
          className="w-1 bg-white rounded-full"
          animate={{
            height: [8, 16, 8],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 0.5,
            delay: index * 0.1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
      <span className="text-white text-xs ml-2 opacity-75">sizzle...</span>
    </div>
  );
} 