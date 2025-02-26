"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Camera } from "lucide-react";

interface CoinSlotProps {
  onStart: () => void;
}

export function CoinSlot({ onStart }: CoinSlotProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleCoinInsert = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onStart();
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-md mx-auto bg-zinc-900 p-8 rounded-xl shadow-2xl relative"
    >
      <div className="text-center mb-8">
        <Camera className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
        <h2 className="text-2xl font-bold mb-2">Insert Coin to Start</h2>
        <p className="text-gray-400">$1.00 per session</p>
      </div>

      <motion.button
        onClick={handleCoinInsert}
        disabled={isAnimating}
        className="w-full bg-yellow-400 text-black py-3 px-6 rounded-lg font-bold 
                 hover:bg-yellow-300 transition-colors relative overflow-hidden"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isAnimating ? (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: "100%" }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-yellow-500"
          />
        ) : (
          "Insert Coin"
        )}
      </motion.button>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Vintage photo experience</p>
        <p>3 shots • Multiple filters • Instant download</p>
      </div>
    </motion.div>
  );
}