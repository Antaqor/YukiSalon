"use client";
import { motion } from "framer-motion";


export default function LoadingOverlay() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin" />
    </motion.div>
  );
}
