"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, ThumbsUp, ThumbsDown, RotateCcw, Check, Pencil, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";
import { cn, formatDateTime } from "@/utils";
import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  index: number;
  onRegenerate?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
}

export default function MessageBubble({
  message,
  index,
  onRegenerate,
  onEdit,
}: MessageBubbleProps) {
  const [copied, setCopied]       = useState(false);
  const [liked, setLiked]         = useState<"up" | "down" | null>(null);
  const [editing, setEditing]     = useState(false);
  const [editValue, setEditValue] = useState(message.content);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditSubmit = () => {
    if (editValue.trim() && editValue.trim() !== message.content) {
      onEdit?.(message.id, editValue.trim());
    }
    setEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEditSubmit(); }
    if (e.key === "Escape") { setEditValue(message.content); setEditing(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 380, damping: 28 }}
      className={cn("flex gap-3 group", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        {isUser ? (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, #7C3AED, #22D3EE)" }}
          >
            A
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full blur-sm opacity-70" style={{ background: "linear-gradient(135deg, #7C3AED, #22D3EE)" }} />
            <div className="relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: "linear-gradient(135deg, #7C3AED, #22D3EE)" }}>N</div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cn("flex flex-col max-w-[75%]", isUser ? "items-end" : "items-start")}>

        {/* Bubble */}
        <div
          className={cn("relative px-4 py-3 rounded-2xl text-sm leading-relaxed", isUser ? "text-white rounded-tr-sm" : "rounded-tl-sm")}
          style={
            isUser
              ? { background: "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 60%, #22D3EE 100%)", boxShadow: "0 4px 24px rgba(124,58,237,0.3)" }
              : { background: "var(--color-ai-bubble)", border: "1px solid var(--color-ai-bubble-border)", color: "var(--color-text)" }
          }
        >
          <AnimatePresence mode="wait">
            {/* Edit mode */}
            {editing ? (
              <motion.div key="editing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-2">
                <textarea
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  rows={Math.max(2, editValue.split("\n").length)}
                  className="w-full bg-transparent text-sm text-white resize-none focus:outline-none leading-relaxed min-w-[200px]"
                  style={{ caretColor: "#fff" }}
                />
                <div className="flex items-center gap-1.5 justify-end">
                  <button
                    onClick={() => { setEditValue(message.content); setEditing(false); }}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium"
                    style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
                  >
                    <X size={10} /> Cancel
                  </button>
                  <button
                    onClick={handleEditSubmit}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium"
                    style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
                  >
                    <Check size={10} /> Send
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Normal content */
              <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold" style={{ color: isUser ? "#fff" : "var(--color-text)" }}>{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-semibold mb-1.5 mt-2 first:mt-0">{children}</h3>,
                    ul: ({ children }) => <ul className="mb-2 ml-4 space-y-1 list-disc">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-2 ml-4 space-y-1 list-decimal">{children}</ol>,
                    li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
                    code: ({ inline, children }: { inline?: boolean; children?: React.ReactNode }) =>
                      inline ? (
                        <code className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: isUser ? "rgba(255,255,255,0.2)" : "var(--color-overlay)", color: isUser ? "#fff" : "var(--color-cyan, #22D3EE)" }}>{children}</code>
                      ) : (
                        <pre className="rounded-xl p-3 my-2 overflow-x-auto text-xs font-mono leading-relaxed" style={{ background: "var(--color-bg)" }}><code>{children}</code></pre>
                      ),
                    blockquote: ({ children }) => <blockquote className="border-l-2 border-violet-400 pl-3 my-2 italic" style={{ color: "var(--color-text-sub)" }}>{children}</blockquote>,
                    hr: () => <hr className="my-3 border-none h-px" style={{ background: "var(--color-border)" }} />,
                    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="underline text-violet-400 hover:text-violet-300">{children}</a>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Streaming indicator */}
          {message.isStreaming && (
            <>
              {message.content === "" ? (
                <div className="flex items-center gap-1.5 py-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div key={i} animate={{ y: [-3, 3, -3], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.18, ease: "easeInOut" }} className="w-2 h-2 rounded-full" style={{ background: "linear-gradient(135deg, #7C3AED, #22D3EE)" }} />
                  ))}
                </div>
              ) : (
                <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.7 }} className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 align-middle rounded-full" />
              )}
            </>
          )}
        </div>

        {/* Meta row — shows on group hover */}
        {!editing && !message.isStreaming && (
          <div className={cn(
            "flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            isUser ? "flex-row-reverse" : "flex-row"
          )}>
            {/* Timestamp — always visible on hover */}
            <span className="text-[10px] px-1" style={{ color: "var(--color-text-muted)" }}>
              {formatDateTime(message.timestamp)}
            </span>

            {/* User message actions */}
            {isUser && (
              <div className="flex items-center gap-0.5 flex-row-reverse">
                <ActionButton onClick={handleCopy} title="Copy message">
                  {copied ? <Check size={11} className="text-emerald-400 cursor-pointer" /> : <Copy size={11} />}
                </ActionButton>
                <ActionButton onClick={() => { setEditValue(message.content); setEditing(true); }} title="Edit message">
                  <Pencil size={11} className="cursor-pointer" />
                </ActionButton>
                <ActionButton onClick={() => onRegenerate?.(message.id)} title="Regenerate response">
                  <RotateCcw size={11} className="cursor-pointer" />
                </ActionButton>
              </div>
            )}

            {/* AI message actions */}
            {!isUser && (
              <div className="flex items-center gap-0.5">
                <ActionButton onClick={handleCopy} title="Copy response">
                  {copied ? <Check size={11} className="text-emerald-400 cursor-pointer" /> : <Copy size={11} className="cursor-pointer" />}
                </ActionButton>
                <ActionButton onClick={() => setLiked(liked === "up" ? null : "up")} title="Good response">
                  <ThumbsUp size={11} className={liked === "up" ? "text-violet-400" : ""} />
                </ActionButton>
                <ActionButton onClick={() => setLiked(liked === "down" ? null : "down")} title="Bad response">
                  <ThumbsDown size={11} className={liked === "down" ? "text-rose-400" : ""} />
                </ActionButton>
                <ActionButton onClick={() => onRegenerate?.(message.id)} title="Regenerate">
                  <RotateCcw size={11} />
                </ActionButton>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ActionButton({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      title={title}
      className="p-1 rounded-md transition-all"
      style={{ color: "var(--color-text-muted)" }}
      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-text)"; e.currentTarget.style.background = "var(--color-elevated)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-muted)"; e.currentTarget.style.background = "transparent"; }}
    >
      {children}
    </motion.button>
  );
}