"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Zap,
  Star,
  Crown,
  MessageCircleDashedIcon,
  MessageCircle,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn, formatDate } from "@/utils";
import type { Conversation, UserProfile } from "@/types";
import { ProfileSettings } from "../profile";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void; // ✅ added
  onNew: () => void;
  collapsed: boolean;
  onToggle: () => void;
}

const USER: UserProfile = {
  id: "1",
  name: "Alex Rivera",
  email: "alex@studio.dev",
  plan: "pro",
};

const PLAN_BADGE = {
  free: {
    label: "Free",
    icon: null,
    style: {
      color: "var(--color-text-sub)",
      background: "var(--color-overlay)",
    },
  },
  pro: {
    label: "Pro",
    icon: Zap,
    style: { color: "#A78BFA", background: "rgba(124,58,237,0.15)" },
  },
  enterprise: {
    label: "Enterprise",
    icon: Crown,
    style: { color: "#FCD34D", background: "rgba(245,158,11,0.15)" },
  },
};

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onDelete, // ✅ added
  onNew,
  collapsed,
  onToggle,
}: SidebarProps) {
  const [search, setSearch] = useState("");
  // const [showProfile, setShowProfile] = useState(false);

  const filtered = conversations.filter((c) =>
    (c.title ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const pinned = filtered.filter((c) => c.pinned);
  const recent = filtered.filter((c) => !c.pinned);
  // const badge = PLAN_BADGE[USER.plan];

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 280 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-full overflow-hidden"
      style={{ background: "var(--color-sidebar)" }}
    >
      {/* Top edge glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      {/* ── Header ── */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-5",
          collapsed ? "flex-col gap-2 px-0" : "flex-row gap-3",
        )}
      >
        {/* Collapse toggle */}
        {
          collapsed! && (
            <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggle}
          className="shrink-0 p-1.5 rounded-lg transition-all cursor-pointer"
          style={{
            color: "var(--color-icon)",
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--color-icon-hover)";
            e.currentTarget.style.background = "var(--color-hover-bg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--color-icon)";
            e.currentTarget.style.background = "transparent";
          }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen size={15} />
          ) : (
            <PanelLeftClose size={15} />
          )}
        </motion.button>
          )
        }
        {/* Logo mark */}
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          className="relative flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer"
          style={{ background: "linear-gradient(135deg, #7C3AED, #22D3EE)" }}
          onClick={onNew}
        >
          <span className="text-white font-black text-sm">N</span>
          <div
            className="absolute inset-0 rounded-xl blur-sm opacity-60"
            style={{ background: "linear-gradient(135deg, #7C3AED, #22D3EE)" }}
          />
        </motion.div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex-1 overflow-hidden"
            >
              <p
                className="font-bold text-base truncate"
                style={{ color: "var(--color-text)" }}
              >
                Nexus AI
              </p>
              <p
                className="text-xs truncate"
                style={{ color: "var(--color-text-muted)" }}
              >
                Intelligent assistant
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Collapse toggle */}
        {!collapsed && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggle}
            className="shrink-0 p-1.5 rounded-lg transition-all cursor-pointer"
            style={{
              color: "var(--color-icon)",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--color-icon-hover)";
              e.currentTarget.style.background = "var(--color-hover-bg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--color-icon)";
              e.currentTarget.style.background = "transparent";
            }}
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose size={15} />
          </motion.button>
        )}
      </div>

      {/* ── New Chat Button ── */}
      <div className={cn("px-3 mb-3", collapsed && "px-2")}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNew}
          className={cn(
            "w-full flex items-center gap-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer",
            "bg-violet-600 hover:bg-violet-500 text-white",
            collapsed ? "justify-center p-3" : "px-3.5 py-2.5",
          )}
          style={{ boxShadow: "var(--shadow-glow)" }}
        >
          <MessageCircleDashedIcon size={16} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                New Chat
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ── Search ── */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 mb-3"
          >
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--color-text-muted)" }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations…"
                className="w-full rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-violet-500/50 transition-all"
                style={{
                  background: "var(--color-hover-bg)",
                  border: "1px solid var(--color-subtle-border)",
                  color: "var(--color-text)",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Conversations List ── */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 scrollbar-thin">
        {/* Pinned */}
        {pinned.length > 0 && !collapsed && (
          <>
            <p
              className="text-[10px] font-semibold uppercase tracking-widest px-2 pt-1 pb-1.5"
              style={{ color: "var(--color-text-muted)" }}
            >
              Pinned
            </p>
            {pinned.map((c, i) => (
              <ConversationItem
                key={c.id}
                conv={c}
                active={c.id === activeId}
                onSelect={onSelect}
                onDelete={onDelete} // ✅ added
                collapsed={collapsed}
                index={i}
              />
            ))}
            <div
              className="h-px my-2 mx-2"
              style={{ background: "var(--color-divider)" }}
            />
          </>
        )}

        {/* Recent */}
        {!collapsed && (
          <p
            className="text-[10px] font-semibold uppercase tracking-widest px-2 pt-1 pb-1.5"
            style={{ color: "var(--color-text-muted)" }}
          >
            Recent
          </p>
        )}
        {recent.map((c, i) => (
          <ConversationItem
            key={c.id}
            conv={c}
            active={c.id === activeId}
            onSelect={onSelect}
            onDelete={onDelete} // ✅ added
            collapsed={collapsed}
            index={i}
          />
        ))}
      </div>

      {/* ── Footer / Profile ── */}
      <div
        className="p-2"
        style={{ borderTop: "1px solid var(--color-divider)" }}
      >
        <ProfileSettings />
      </div>
    </motion.aside>
  );
}

function ConversationItem({
  conv,
  active,
  onSelect,
  onDelete,
  collapsed,
  index,
}: {
  conv: Conversation;
  active: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  collapsed: boolean;
  index: number;
}) {
  return (
    <div
      onClick={() => onSelect(conv.id)}
      className={cn(
        "w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all group border cursor-pointer",
        collapsed && "justify-center",
      )}
      style={
        active
          ? {
              background: "rgba(124,58,237,0.15)",
              borderColor: "rgba(124,58,237,0.25)",
              color: "var(--color-text)",
            }
          : {
              background: "transparent",
              borderColor: "transparent",
              color: "var(--color-text-sub)",
            }
      }
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.color = "var(--color-text)";
          e.currentTarget.style.background = "var(--color-hover-bg)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.color = "var(--color-text-sub)";
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      {/* Icon / indicator */}
      <div
        className={cn(
          "flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all",
          active ? "bg-violet-500/25 text-violet-400" : "",
        )}
        style={
          !active
            ? {
                background: "var(--color-hover-bg)",
                color: "var(--color-text-muted)",
              }
            : undefined
        }
      >
        {conv.pinned ? (
          <Star size={11} fill="currentColor" />
        ) : (
          <MessageCircle size={14} />
        )}
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-hidden">
          <p className="text-xs font-medium truncate">{conv.title}</p>
          <p
            className="text-[10px] truncate mt-0.5"
            style={{ color: "var(--color-text-muted)" }}
          >
            {formatDate(conv.timestamp)}
          </p>
        </div>
      )}

      {!collapsed && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onDelete(conv.id);
          }}
          className="p-1 rounded-md transition-all shrink-0 cursor-pointer"
          style={{ color: "var(--color-text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--color-text-muted)")
          }
          title="Delete conversation"
        >
          <Trash2 size={15} />
        </div>
      )}
    </div>
  );
}
