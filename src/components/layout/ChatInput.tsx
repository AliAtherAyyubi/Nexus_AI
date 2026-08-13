"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Send, Mic, Sparkles, FileText, X, Plus,
  Globe, FolderOpen, ImageIcon, ChevronDown, Check,
  Paperclip, Loader2,
} from "lucide-react";
import { cn } from "@/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uri?: string;        // Gemini file URI after upload
  preview?: string;    // data-url for images
  uploading?: boolean;
  error?: string;
}

interface Model {
  id: string;
  label: string;
  badge?: string;
}

const MODELS: Model[] = [
  { id: "gemini-3.5-flash-lite",        label: "Nexus 3.5 Flash Lite",   badge: "Fast"    },
  { id: "gemini-2.5-flash",   label: "Nexus 2.5 Flash",          badge: "Fastest" },
  { id: "gemini-2.5-flash-lite",          label: "Nexus 2.5 Flash Lite",      badge: "Smart"   },
  // { id: "gemini-3.5-flash-lite", label: "Gemini 2.5 Flash", badge: "New" },
];

// ─── Props ───────────────────────────────────────────────────────────────────

interface ChatInputProps {
  onSend: (message: string, pdfUri?: string, model?: string) => void;
  onPdfUploaded: (uri: string, name: string) => void;
  isLoading: boolean;
  conversationId: string | null;
  activePdfUri: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(type: string) {
  if (type.startsWith("image/")) return <ImageIcon size={14} className="text-violet-400" />;
  return <FileText size={14} className="text-violet-400" />;
}

// ─── Plus menu items ──────────────────────────────────────────────────────────

const PLUS_ITEMS = [
  { id: "pdf",    label: "Upload file",    icon: Paperclip, accept: ".pdf,image/*" },
  { id: "search", label: "Web search",     icon: Globe,     accept: null            },
  { id: "project",label: "From project",   icon: FolderOpen,accept: null            },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function ChatInput({
  onSend,
  onPdfUploaded,
  isLoading,
  conversationId,
  activePdfUri,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [plusOpen, setPlusOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model>(MODELS[0]);
  const [webSearch, setWebSearch] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const plusRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (plusRef.current && !plusRef.current.contains(e.target as Node)) setPlusOpen(false);
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) setModelOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Upload file to Gemini ──────────────────────────────────────────────────
  const uploadFile = useCallback(async (file: File) => {
    const id = crypto.randomUUID();
    const isImage = file.type.startsWith("image/");

    // Build preview for images
    let preview: string | undefined;
    if (isImage) {
      preview = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    // Add placeholder
    setFiles((prev) => [...prev, {
      id, name: file.name, size: file.size,
      type: file.type, preview, uploading: true,
    }]);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (conversationId) formData.append("conversationId", conversationId);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, uploading: false, uri: data.uri } : f
        )
      );
      onPdfUploaded(data.uri, file.name);
    } catch (err) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, uploading: false, error: err instanceof Error ? err.message : "Upload failed" }
            : f
        )
      );
    }
  }, [conversationId, onPdfUploaded]);

  // ── Handle file input change ───────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    picked.forEach(uploadFile);
    e.target.value = "";
    setPlusOpen(false);
  };

  // ── Remove attached file ───────────────────────────────────────────────────
  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = () => {
    if (!value.trim() || isLoading) return;
    const pdfUri = files.find((f) => f.uri)?.uri ?? activePdfUri ?? undefined;
    onSend(value.trim(), pdfUri, selectedModel.id);
    setValue("");
    setFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = value.trim().length > 0 && !isLoading;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="px-4 pb-4 pt-2 w-full max-w-3xl mx-auto">

      {/* ── File previews (above input, Claude-style) ── */}
      <AnimatePresence>
        {(files.length > 0 || activePdfUri) && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="flex flex-wrap gap-2 overflow-hidden"
          >
            {/* Active PDF from previous upload */}
            {activePdfUri && files.length === 0 && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs border"
                style={{
                  background: "rgba(124,58,237,0.08)",
                  borderColor: "rgba(124,58,237,0.25)",
                  color: "var(--color-text-sub)",
                }}
              >
                <FileText size={13} className="text-violet-400 flex-shrink-0" />
                <span className="text-violet-300 font-medium">PDF active in this chat</span>
              </div>
            )}

            {/* Newly attached files */}
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.9, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 6 }}
                className="relative flex items-center gap-2.5 rounded-xl border overflow-hidden"
                style={{
                  background: "var(--color-elevated)",
                  borderColor: file.error
                    ? "rgba(239,68,68,0.4)"
                    : "var(--color-border)",
                  padding: "8px 10px",
                  maxWidth: 220,
                }}
              >
                {/* Image preview thumbnail */}
                {file.preview ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(124,58,237,0.12)" }}
                  >
                    {file.uploading
                      ? <Loader2 size={16} className="text-violet-400 animate-spin" />
                      : fileIcon(file.type)
                    }
                  </div>
                )}

                {/* Name + size */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-medium truncate"
                    style={{ color: "var(--color-text)" }}
                  >
                    {file.name}
                  </p>
                  <p
                    className="text-[10px]"
                    style={{ color: file.error ? "#EF4444" : "var(--color-text-muted)" }}
                  >
                    {file.error ?? (file.uploading ? "Uploading…" : formatBytes(file.size))}
                  </p>
                </div>

                {/* Remove */}
                {!file.uploading && (
                  <button
                    onClick={() => removeFile(file.id)}
                    className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-all"
                    style={{ color: "var(--color-text-muted)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
                  >
                    <X size={11} />
                  </button>
                )}

                {/* Upload progress overlay */}
                {file.uploading && (
                  <motion.div
                    className="absolute inset-x-0 bottom-0 h-0.5"
                    style={{ background: "linear-gradient(90deg, #7C3AED, #22D3EE)" }}
                    animate={{ scaleX: [0, 1] }}
                    transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main input box ── */}
      <div
        className="relative rounded-2xl border transition-all duration-200"
        style={{
          background: "var(--color-input-bg)",
          borderColor: focused ? "rgba(124,58,237,0.6)" : "var(--color-border)",
          boxShadow: focused
            ? "0 0 0 1px rgba(124,58,237,0.3), 0 8px 32px rgba(124,58,237,0.12)"
            : "none",
        }}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Message Nexus…"
          rows={1}
          className="w-full bg-transparent px-4 pt-3.5 pb-2 text-sm resize-none focus:outline-none leading-relaxed"
          style={{
            color: "var(--color-text)",
            caretColor: "var(--color-accent)",
          }}
        />

        {/* ── Bottom toolbar ── */}
        <div className="flex items-center justify-between px-3 pb-3 gap-2">

          {/* LEFT — Plus menu + extras */}
          <div className="flex items-center gap-1.5">

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Plus button + dropdown */}
            <div ref={plusRef} className="relative">
              <button
                onClick={() => setPlusOpen((p) => !p)}
                className="flex items-center justify-center w-7 h-7 rounded-lg transition-all cursor-pointer"
                style={{
                  background: plusOpen ? "rgba(124,58,237,0.15)" : "var(--color-elevated)",
                  border: "1px solid var(--color-border)",
                  color: plusOpen ? "#8B5CF6" : "var(--color-text-muted)",
                }}
                onMouseEnter={(e) => {
                  if (!plusOpen) e.currentTarget.style.color = "var(--color-text)";
                }}
                onMouseLeave={(e) => {
                  if (!plusOpen) e.currentTarget.style.color = "var(--color-text-muted)";
                }}
                title="Attach"
              >
                <Plus size={16} fontWeight={800} />
              </button>

              <AnimatePresence>
                {plusOpen && (
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
                    {PLUS_ITEMS.map((item, i) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (item.accept) {
                            fileInputRef.current?.click();
                          } else if (item.id === "search") {
                            setWebSearch((w) => !w);
                            setPlusOpen(false);
                          } else {
                            setPlusOpen(false);
                          }
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 text-xs text-left transition-all cursor-pointer",
                          i < PLUS_ITEMS.length - 1 && "border-b",
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
                        <span className="font-medium">{item.label}</span>
                        {item.id === "search" && webSearch && (
                          <Check size={11} className="ml-auto text-violet-400" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Web search pill (when active) */}
            <AnimatePresence>
              {webSearch && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium"
                  style={{
                    background: "rgba(34,211,238,0.1)",
                    border: "1px solid rgba(34,211,238,0.3)",
                    color: "#22D3EE",
                  }}
                >
                  <Globe size={10} />
                  Web search
                  <button onClick={() => setWebSearch(false)}>
                    <X size={9} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nexus label */}
            <div
              className="hidden sm:flex items-center gap-1.5 text-[10px] ml-1"
              style={{ color: "var(--color-text-muted)" }}
            >
              <Sparkles size={10} className="text-violet-500" />
              <span>Shift+Enter for new line</span>
            </div>
          </div>

          {/* RIGHT — Model selector + mic + send */}
          <div className="flex items-center gap-1.5">

            {/* Model dropdown */}
            <div ref={modelRef} className="relative">
              <button
                onClick={() => setModelOpen((m) => !m)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer"
                style={{
                  background: modelOpen ? "rgba(124,58,237,0.15)" : "var(--color-elevated)",
                  border: "1px solid var(--color-border)",
                  color: modelOpen ? "#8B5CF6" : "var(--color-text-sub)",
                }}
                onMouseEnter={(e) => {
                  if (!modelOpen) e.currentTarget.style.color = "var(--color-text)";
                }}
                onMouseLeave={(e) => {
                  if (!modelOpen) e.currentTarget.style.color = "var(--color-text-sub)";
                }}
              >
                <Sparkles size={10} className="text-violet-400" />
                <span className="max-w-[80px] truncate">{selectedModel.label}</span>
                <ChevronDown
                  size={10}
                  className="transition-transform"
                  style={{ transform: modelOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </button>

              <AnimatePresence>
                {modelOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    className="absolute bottom-full right-0 mb-2 w-52 rounded-xl border overflow-hidden z-50"
                    style={{
                      background: "var(--color-elevated)",
                      borderColor: "var(--color-border)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                    }}
                  >
                    <p
                      className="text-[10px] font-semibold uppercase tracking-widest px-3 pt-2.5 pb-1"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Model
                    </p>
                    {MODELS.map((model, i) => (
                      <button
                        key={model.id}
                        onClick={() => { setSelectedModel(model); setModelOpen(false); }}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left transition-all cursor-pointer",
                          i < MODELS.length - 1 && "border-b",
                        )}
                        style={{
                          color: selectedModel.id === model.id
                            ? "var(--color-text)"
                            : "var(--color-text-sub)",
                          borderColor: "var(--color-border)",
                          background: selectedModel.id === model.id
                            ? "rgba(124,58,237,0.08)"
                            : "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (selectedModel.id !== model.id) {
                            e.currentTarget.style.background = "rgba(124,58,237,0.06)";
                            e.currentTarget.style.color = "var(--color-text)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedModel.id !== model.id) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "var(--color-text-sub)";
                          }
                        }}
                      >
                        <div className="flex-1">
                          <span className="font-medium">{model.label}</span>
                        </div>
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
                        {selectedModel.id === model.id && (
                          <Check size={11} className="text-violet-400 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mic */}
            <button
              className="flex items-center justify-center w-7 h-7 rounded-lg transition-all"
              style={{
                color: "var(--color-text-muted)",
                background: "var(--color-elevated)",
                border: "1px solid var(--color-border)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
              title="Voice input"
            >
              <Mic size={13} />
            </button>

            {/* Send */}
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={cn(
                "flex items-center justify-center w-7 h-7 rounded-lg transition-all",
                canSend ? "cursor-pointer" : "cursor-not-allowed",
              )}
              style={
                canSend
                  ? {
                      background: "linear-gradient(135deg, #7C3AED, #22D3EE)",
                      boxShadow: "0 0 14px rgba(124,58,237,0.5)",
                      color: "#fff",
                    }
                  : {
                      background: "var(--color-elevated)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text-muted)",
                    }
              }
              title="Send"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-0.5"
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [-2, 2, -2] }}
                        transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15 }}
                        className="w-1 h-1 rounded-full"
                        style={{ background: "var(--color-text-muted)" }}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="send"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Send size={13} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      <p
        className="text-center text-[10px] mt-2"
        style={{ color: "var(--color-text-muted)" }}
      >
        Nexus can make mistakes. Verify important information.
      </p>
    </div>
  );
}