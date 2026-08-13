"use client";
import { useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Paperclip, Globe, FolderOpen, Check } from "lucide-react";
import { cn } from "@/utils";

// ─── Menu item definitions ────────────────────────────────────────────────────

const MENU_ITEMS = [
  { id: "file",   label: "Upload file",  icon: Paperclip,  accept: ".pdf,image/*" },
  { id: "search", label: "Web search",   icon: Globe,       accept: null           },
  { id: "project",label: "From project", icon: FolderOpen,  accept: null           },
] as const;

type MenuItemId = (typeof MENU_ITEMS)[number]["id"];

// ─── Props ────────────────────────────────────────────────────────────────────

interface PlusMenuProps {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  webSearch: boolean;
  onWebSearchToggle: () => void;
  onFileClick: () => void;          // triggers hidden <input>
  onFileChange: (files: FileList) => void;
  fileAccept?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PlusMenu({
  open,
  onToggle,
  onClose,
  webSearch,
  onWebSearchToggle,
  onFileClick,
  onFileChange,
  fileAccept = ".pdf,image/*",
}: PlusMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef  = useRef<HTMLInputElement>(null);

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

  const handleItemClick = (id: MenuItemId) => {
    if (id === "file") {
      fileInputRef.current?.click();
      // keep menu open until file chosen
    } else if (id === "search") {
      onWebSearchToggle();
      onClose();
    } else {
      onClose();
    }
  };

  return (
    <div ref={containerRef} className="relative ">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={fileAccept}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) onFileChange(e.target.files);
          e.target.value = "";
          onClose();
        }}
      />

      {/* Trigger button */}
      <button
        onClick={onToggle}
        title="Attach"
        className="flex items-center justify-center w-7 h-7 rounded-lg transition-all cursor-pointer"
        style={{
          background: open ? "rgba(124,58,237,0.15)" : "var(--color-elevated)",
          border: "1px solid var(--color-border)",
          color: open ? "#8B5CF6" : "var(--color-text-muted)",
        }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.color = "var(--color-text)";
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.color = "var(--color-text-muted)";
        }}
      >
        <Plus size={14} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="absolute bottom-full left-0 mb-2 w-44 rounded-xl border overflow-hidden z-50"
            style={{
              background: "var(--color-elevated)",
              borderColor: "var(--color-border)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            {MENU_ITEMS.map((item, i) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-xs text-left transition-all",
                  i < MENU_ITEMS.length - 1 && "border-b",
                )}
                style={{
                  color: "var(--color-text-sub)",
                  borderColor: "var(--color-border)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(124,58,237,0.08)";
                  e.currentTarget.style.color = "var(--color-text)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--color-text-sub)";
                }}
              >
                <item.icon size={14} className="text-violet-400 flex-shrink-0" />
                <span className="font-medium flex-1">{item.label}</span>
                {item.id === "search" && webSearch && (
                  <Check size={11} className="text-violet-400" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
