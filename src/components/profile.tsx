"use client";

import { useRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheckIcon, SunMoon, LogOutIcon, ChevronDown, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ProfileSettings() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fullName =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "Account";
  const email = user?.email ?? "";
  const initials = getInitials(fullName);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">

      {/* ── Trigger ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl transition-all cursor-pointer"
        style={{
          background: open ? "rgba(124,58,237,0.1)" : "transparent",
          border: "1px solid",
          borderColor: open ? "rgba(124,58,237,0.3)" : "transparent",
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.background = "var(--color-elevated)";
            e.currentTarget.style.borderColor = "var(--color-border)";
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "transparent";
          }
        }}
      >
        {/* Avatar */}
        <div
          className="relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #7C3AED, #22D3EE)" }}
        >
          {initials}
          {/* Online dot */}
          <div
            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
            style={{
              background: "#10B981",
              borderColor: "var(--color-sidebar)",
            }}
          />
        </div>

        {/* Name + email */}
        <div className="flex-1 overflow-hidden text-left">
          <p
            className="text-xs font-semibold truncate"
            style={{ color: "var(--color-text)" }}
          >
            {fullName}
          </p>
          <p
            className="text-[10px] truncate"
            style={{ color: "var(--color-text-muted)" }}
          >
            {email}
          </p>
        </div>

        {/* Chevron */}
        <ChevronDown
          size={12}
          className="flex-shrink-0 transition-transform duration-200"
          style={{
            color: "var(--color-text-muted)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* ── Dropdown ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border overflow-hidden z-50"
            style={{
              background: "var(--color-elevated)",
              borderColor: "var(--color-border)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            {/* User info header */}
            <div
              className="flex items-center gap-2.5 px-3 py-3 border-b"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #7C3AED, #22D3EE)" }}
              >
                {initials}
              </div>
              <div className="flex-1 overflow-hidden">
                <p
                  className="text-xs font-semibold truncate"
                  style={{ color: "var(--color-text)" }}
                >
                  {fullName}
                </p>
                <p
                  className="text-[10px] truncate"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {email}
                </p>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1">

              {/* Account */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-left transition-all cursor-pointer"
                style={{ color: "var(--color-text-sub)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(124,58,237,0.08)";
                  e.currentTarget.style.color = "var(--color-text)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--color-text-sub)";
                }}
                onClick={() => setOpen(false)}
              >
                <BadgeCheckIcon size={14} className="text-violet-400 flex-shrink-0" />
                <span className="font-medium flex-1">Account</span>
              </button>

              {/* Dark mode toggle */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-left transition-all cursor-pointer"
                style={{ color: "var(--color-text-sub)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(124,58,237,0.08)";
                  e.currentTarget.style.color = "var(--color-text)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--color-text-sub)";
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTheme();
                }}
              >
                <SunMoon size={14} className="text-violet-400 flex-shrink-0" />
                <span className="font-medium flex-1">Dark mode</span>
                {/* Toggle pill */}
                <div
                  className="relative w-8 h-4 rounded-full transition-all flex-shrink-0"
                  style={{
                    background: theme === "dark"
                      ? "linear-gradient(135deg, #7C3AED, #8B5CF6)"
                      : "var(--color-border)",
                  }}
                >
                  <motion.div
                    animate={{ x: theme === "dark" ? 16 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 w-3 h-3 rounded-full bg-white"
                  />
                </div>
              </button>
            </div>

            {/* Divider */}
            <div
              className="h-px mx-2"
              style={{ background: "var(--color-border)" }}
            />

            {/* Sign out */}
            <div className="py-1">
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-left transition-all cursor-pointer"
                style={{ color: "var(--color-text-sub)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                  e.currentTarget.style.color = "#EF4444";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--color-text-sub)";
                }}
                onClick={() => { setOpen(false); signOut(); }}
              >
                <LogOutIcon size={14} className="flex-shrink-0" />
                <span className="font-medium">Sign out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}