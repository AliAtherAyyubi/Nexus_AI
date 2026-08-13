"use client";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, ImageIcon, X, Loader2 } from "lucide-react";
import type { AttachedFile } from "@/utils/types";
import { formatBytes } from "@/utils/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface FilePreviewStripProps {
  files: AttachedFile[];
  activePdfUri: string | null; // PDF already linked from a previous upload
  onRemove: (id: string) => void;
  activePdfName: string | null;
}

// ─── Single file card ─────────────────────────────────────────────────────────

function FileCard({
  file,
  onRemove,
}: {
  file: AttachedFile;
  onRemove: (id: string) => void;
}) {
  const isImage = file.type.startsWith("image/");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 6 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className="relative flex items-center gap-2.5 rounded-xl border overflow-hidden flex-shrink-0"
      style={{
        background: "var(--color-elevated)",
        borderColor: file.error ? "rgba(239,68,68,0.4)" : "var(--color-border)",
        padding: "8px 10px",
        maxWidth: 220,
      }}
    >
      {/* Thumbnail (image) or icon (pdf/other) */}
      {isImage && file.preview ? (
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
          {file.uploading ? (
            <Loader2 size={16} className="text-violet-400 animate-spin" />
          ) : isImage ? (
            <ImageIcon size={14} className="text-violet-400" />
          ) : (
            <FileText size={14} className="text-violet-400" />
          )}
        </div>
      )}

      {/* Name + status */}
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-medium truncate"
          style={{ color: "var(--color-text)" }}
        >
          {file.name}
        </p>
        <p
          className="text-[10px]"
          style={{
            color: file.error ? "#EF4444" : "var(--color-text-muted)",
          }}
        >
          {file.error
            ? file.error
            : file.uploading
              ? "Uploading…"
              : formatBytes(file.size)}
        </p>
      </div>

      {/* Remove button */}
      {!file.uploading && !file.uri && (
        <button
          onClick={() => onRemove(file.id)}
          className="shrink flex items-center justify-center w-4 h-4 rounded-full transition-all"
          style={{ color: "var(--color-text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--color-text-muted)")
          }
          title="Remove"
        >
          <X size={11} />
        </button>
      )}

      {/* Uploading progress bar */}
      {file.uploading && (
        <motion.div
          className="absolute inset-x-0 bottom-0 h-0.5"
          style={{ background: "linear-gradient(90deg, #7C3AED, #22D3EE)" }}
          animate={{ scaleX: [0, 1] }}
          transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

// ─── Strip ────────────────────────────────────────────────────────────────────

export default function FilePreviewStrip({
  files,
  activePdfUri,
  activePdfName,
  onRemove,
}: FilePreviewStripProps) {
  const showActivePill = activePdfUri && files.length === 0;
  const hasContent = files.length > 0 || showActivePill;

  return (
    <AnimatePresence>
      {hasContent && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          className="flex flex-wrap gap-2 overflow-hidden"
        >
          {/* Persisted PDF pill — shown when there's no new upload but a doc is linked */}
          {showActivePill && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 6 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="relative flex items-center gap-2.5 rounded-xl border overflow-hidden flex-shrink-0"
              style={{
                background: "var(--color-elevated)",
                borderColor: "var(--color-border)",
                padding: "8px 10px",
                maxWidth: 220,
              }}
            >
              {/* PDF icon */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(124,58,237,0.12)" }}
              >
                <FileText size={14} className="text-violet-400" />
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-medium truncate"
                  style={{ color: "var(--color-text)" }}
                >
                  {activePdfName ??
                    files.find((f) => f.uri)?.name ??
                    "Document.pdf"}
                </p>
                <p
                  className="text-[10px]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  PDF · Active
                </p>
              </div>
            </motion.div>
          )}

          {/* Newly attached files */}
          {files.map((file) => (
            <FileCard key={file.id} file={file} onRemove={onRemove} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
