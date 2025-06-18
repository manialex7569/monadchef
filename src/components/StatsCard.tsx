'use client';

import { motion } from 'framer-motion';

interface StatsCardProps {
  value: string | number;
  label: string;
  color: string;
  index: number;
}

export default function StatsCard({ value, label, color, index }: StatsCardProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <motion.div
        className={`text-2xl font-bold ${color}`}
        animate={{
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {value}
      </motion.div>
      <div className="text-sm text-gray-600">{label}</div>
    </motion.div>
  );
} 