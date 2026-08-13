// ─── Shared types for ChatInput sub-components ───────────────────────────────

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uri?: string;        // Gemini file URI after upload
  preview?: string;    // data-url for images
  uploading?: boolean;
  error?: string;
}

export interface Model {
  id: string;
  label: string;
  badge?: string;
}

export const MODELS: Model[] = [
  { id: "gemini-3.5-flash-lite",            label: "Nexus 3.5 Flash",  badge: "Fast"    },
  { id: "gemini-3.1-flash-lite",          label: "Nexus 3.1",        badge: "Fastest" },
  { id: "gemini-2.5-flash",                 label: "Nexus 2.5",    badge: "Smart"   },
  { id: "gemini-2.5-flash-lite", label: "Nexus 2.5 lite",  badge: "New"     },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
