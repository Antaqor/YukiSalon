"use client";
import { motion } from "framer-motion";
import LoadingSkeleton from "./LoadingSkeleton";

export default function LoadingOverlay() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="w-64 p-4 bg-[#0d0d0d] rounded-lg shadow-md">
        <LoadingSkeleton lines={4} />
      </div>
    </motion.div>
  );
}
