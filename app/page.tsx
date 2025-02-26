"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Camera } from "@/components/Camera";
import { CoinSlot } from "@/components/CoinSlot";

export default function Home() {
  const [started, setStarted] = useState(false);

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-red-500 mb-4 font-serif tracking-wider">
            VINTAGE PHOTOBOOTH
          </h1>
          <p className="text-xl text-yellow-400 font-mono">Est. 1990</p>
        </motion.div>

        {!started ? (
          <CoinSlot onStart={() => setStarted(true)} />
        ) : (
          <Camera />
        )}
      </div>

      {/* Vintage Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-5" />
      </div>
    </main>
  );
}