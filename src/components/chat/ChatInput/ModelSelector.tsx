"use client";
import { useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, ChevronDown, Check } from "lucide-react";
import { cn } from "@/utils";
import { MODELS, type Model } from "@/utils/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ModelSelectorProps {
  selected: Model;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelect: (model: Model) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ModelSelector({
  selected,
  open,
  onToggle,
  onClose,
  onSelect,
}: ModelSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
        style={{
          background: open ? "rgba(124,58,237,0.15)" : "var(--color-elevated)",
          border: "1px solid var(--color-border)",
          color: open ? "#8B5CF6" : "var(--color-text-sub)",
        }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.color = "var(--color-text)";
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.color = "var(--color-text-sub)";
        }}
        title="Switch model"
      >
        <Sparkles size={10} className="text-violet-400" />
        <span className="max-w-[80px] truncate">{selected.label}</span>
        <ChevronDown
          size={10}
          className="transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6,  scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: 6,  scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="absolute bottom-full right-0 mb-2 w-52 rounded-xl border overflow-hidden z-50"
            style={{
              background: "var(--color-elevated)",
              borderColor: "var(--color-border)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            {/* Section header */}
            <p
              className="text-[10px] font-semibold uppercase tracking-widest px-3 pt-2.5 pb-1"
              style={{ color: "var(--color-text-muted)" }}
            >
              Model
            </p>

            {MODELS.map((model, i) => {
              const isActive = selected.id === model.id;
              return (
                <button
                  key={model.id}
                  onClick={() => { onSelect(model); onClose(); }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left transition-all",
                    i < MODELS.length - 1 && "border-b",
                  )}
                  style={{
                    color: isActive ? "var(--color-text)" : "var(--color-text-sub)",
                    borderColor: "var(--color-border)",
                    background: isActive ? "rgba(124,58,237,0.08)" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(124,58,237,0.06)";
                      e.currentTarget.style.color = "var(--color-text)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = isActive
                        ? "rgba(124,58,237,0.08)"
                        : "transparent";
                      e.currentTarget.style.color = isActive
                        ? "var(--color-text)"
                        : "var(--color-text-sub)";
                    }
                  }}
                >
                  {/* Label */}
                  <span className="flex-1 font-medium">{model.label}</span>

                  {/* Badge */}
                  {model.badge && (
                    <span
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: "rgba(124,58,237,0.15)",
                        color: "#8B5CF6",
                      }}
                    >
                      {model.badge}
                    </span>
                  )}

                  {/* Active check */}
                  {isActive && (
                    <Check size={11} className="text-violet-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
