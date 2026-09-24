"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Mic, Sparkles, Globe, X } from "lucide-react";
import { cn } from "@/utils";

import PlusMenu        from "./PlusMenu";
import FilePreviewStrip from "./FilePreviewStrip";
import ModelSelector from "./ModelSelector";
import { MODELS, type AttachedFile, type Model } from "@/utils/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ChatInputProps {
  onSend: (message: string, pdfUri?: string, model?: string) => void;
  onPdfUploaded: (uri: string, name: string) => void;
  isLoading: boolean;
  conversationId: string | null;
  activePdfUri: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatInput({
  onSend,
  onPdfUploaded,
  isLoading,
  conversationId,
  activePdfUri,
}: ChatInputProps) {
  // ── Local state ────────────────────────────────────────────────────────────
  const [value,         setValue        ] = useState("");
  const [focused,       setFocused      ] = useState(false);
  const [files,         setFiles        ] = useState<AttachedFile[]>([]);
  const [plusOpen,      setPlusOpen     ] = useState(false);
  const [modelOpen,     setModelOpen    ] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model>(MODELS[0]);
  const [webSearch,     setWebSearch    ] = useState(false);
  const [activePdfName, setActivePdfName] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  // ── Upload a single file to Gemini Files API ───────────────────────────────
  const uploadFile = useCallback(async (file: File) => {
    const id = crypto.randomUUID();
    const isImage = file.type.startsWith("image/");

    // Build image preview locally
    let preview: string | undefined;
    if (isImage) {
      preview = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    // Show placeholder card immediately
    setFiles((prev) => [ 
      ...prev,
      { id, name: file.name, size: file.size, type: file.type, preview, uploading: true },
    ]);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (conversationId) formData.append("conversationId", conversationId);

      const res  = await fetch("/api/documents/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFiles((prev) =>
  prev.map((f) =>
    f.id === id
      ? { ...f, uploading: false, uri: data.uri, name: file.name }
      : f
  )
);
      onPdfUploaded(data.uri, file.name);
      setActivePdfName(file.name);
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

  // ── Handle files chosen from PlusMenu ─────────────────────────────────────
  const handleFileChange = useCallback((fileList: FileList) => {
    Array.from(fileList).forEach(uploadFile);
  }, [uploadFile]);

  // ── Remove a file card ────────────────────────────────────────────────────
  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  // ── Send ──────────────────────────────────────────────────────────────────
 const handleSend = () => {
  if (!value.trim() || isLoading) return;

  const pdfUri = files.find((f) => f.uri)?.uri ?? activePdfUri ?? undefined;
  onSend(value.trim(), pdfUri, selectedModel.id);
  setValue("");
  // Keep files with URI — don't clear them
};

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = value.trim().length > 0 && !isLoading;

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="px-4 pb-1 pt-0 w-full max-w-3xl mx-auto">

      

      {/* ── Input box ── */}
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
        {/* ── File previews above input ── */}
      <FilePreviewStrip
        files={files}
        activePdfUri={activePdfUri}
        onRemove={removeFile}
        activePdfName={activePdfName} 
      />
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
          style={{ color: "var(--color-text)", caretColor: "var(--color-accent)" }}
        />

        {/* ── Bottom toolbar ── */}
        <div className="flex items-center justify-between px-3 pb-3 gap-2 cursor-pointer">

          {/* LEFT ── Plus menu + web-search pill + hint */}
          <div className="flex items-center gap-1.5 ">

            <PlusMenu
              open={plusOpen}
              onToggle={() => setPlusOpen((p) => !p)}
              onClose={() => setPlusOpen(false)}
              webSearch={webSearch}
              onWebSearchToggle={() => setWebSearch((w) => !w)}
              onFileClick={() => {}}         // handled internally by PlusMenu
              onFileChange={handleFileChange}
              
            />

            {/* Web search active pill */}
            <AnimatePresence>
              {webSearch && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1   }}
                  exit={{   opacity: 0, scale: 0.9  }}
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

            {/* Keyboard hint */}
            <div
              className="hidden sm:flex items-center gap-1.5 text-[10px] ml-1"
              style={{ color: "var(--color-text-muted)" }}
            >
              <Sparkles size={10} className="text-violet-500" />
              <span>Shift+Enter for new line</span>
            </div>
          </div>

          {/* RIGHT ── Model selector + mic + send */}
          <div className="flex items-center gap-1.5">

            <ModelSelector
              selected={selectedModel}
              open={modelOpen}
              onToggle={() => setModelOpen((m) => !m)}
              onClose={() => setModelOpen(false)}
              onSelect={setSelectedModel}
            />

            {/* Mic */}
            <button
              title="Voice input"
              className="flex items-center justify-center w-7 h-7 rounded-lg transition-all"
              style={{
                background: "var(--color-elevated)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-muted)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
            >
              <Mic size={13} />
            </button>

            {/* Send */}
            <button
              onClick={handleSend}
              disabled={!canSend}
              title="Send"
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
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{   opacity: 0 }}
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
                    animate={{ opacity: 1, scale: 1   }}
                    exit={{   opacity: 0, scale: 0.8  }}
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
        className="text-center text-[10px] mt-1"
        style={{ color: "var(--color-text-muted)" }}
      >
        Nexus can make mistakes. Verify important information.
      </p>
    </div>
  );
}
