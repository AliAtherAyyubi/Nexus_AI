"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHiding(true);
      setTimeout(onDone, 600);
    }, 2000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <AnimatePresence>
      {!hiding && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: "white" }}
        >
          {/* ── Top center heading ── */}
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute top-10 left-1/2 -translate-x-1/2 text-4xl font-bold tracking-wide"
            style={{
              fontFamily: "var(--font-poppins)",
              background: "linear-gradient(135deg, #7C3AED, #22D3EE)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Nexus AI
          </motion.p>

          {/* ── Outer slow ring ── */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="absolute w-36 h-36 rounded-full"
            style={{
              border: "1.5px solid rgba(124,58,237,0.2)",
              borderTopColor: "rgba(124,58,237,0.9)",
            }}
          />

          {/* ── Middle counter-rotating ring ── */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
            className="absolute w-24 h-24 rounded-full"
            style={{
              border: "1.5px solid rgba(34,211,238,0.15)",
              borderBottomColor: "rgba(34,211,238,0.8)",
            }}
          />

          {/* ── Inner fast ring ── */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
            className="absolute w-14 h-14 rounded-full"
            style={{
              border: "1px solid rgba(139,92,246,0.15)",
              borderRightColor: "rgba(139,92,246,0.7)",
            }}
          />

          {/* ── Orbiting violet dot (outer) ── */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="absolute w-36 h-36"
          >
            <div
              className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
              style={{
                background: "#7C3AED",
                boxShadow: "0 0 10px 3px rgba(124,58,237,0.7)",
              }}
            />
          </motion.div>

          {/* ── Orbiting cyan dot (middle) ── */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="absolute w-24 h-24"
          >
            <div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
              style={{
                background: "#22D3EE",
                boxShadow: "0 0 8px 2px rgba(34,211,238,0.8)",
              }}
            />
          </motion.div>

          {/* ── Center logo only ── */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 20, delay: 0.1 }}
            className="relative"
          >
            <motion.div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white relative z-10"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #22D3EE)",
                fontFamily: "var(--font-poppins)",
              }}
            >
              N
            </motion.div>
            {/* Glow */}
            <div
              className="absolute inset-0 rounded-2xl blur-2xl opacity-60 -z-0"
              style={{ background: "linear-gradient(135deg, #7C3AED, #22D3EE)" }}
            />
          </motion.div>

          {/* ── "Intelligent assistant" just below the rings ── */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="absolute flex flex-col items-center gap-2"
            style={{ top: "calc(50% + 90px)" }}
          >
            <p
              className="text-xs tracking-widest uppercase"
              style={{ color: "rgba(124,58,237,0.7)", fontFamily: "var(--font-poppins)" }}
            >
              Intelligent assistant
            </p>

            {/* Animated loading dots */}
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.25, 1, 0.25], scale: [0.7, 1, 0.7] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    delay: i * 0.22,
                    ease: "easeInOut",
                  }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #22D3EE)" }}
                />
              ))}
            </div>
          </motion.div>

          {/* ── Bottom powered by ── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] tracking-widest uppercase"
            style={{ color: "rgba(124,58,237,0.4)" }}
          >
            Powered by Nexus AI
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}