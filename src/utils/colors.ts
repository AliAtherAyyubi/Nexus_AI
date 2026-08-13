// ─────────────────────────────────────────────
//  Color Design Tokens
// ─────────────────────────────────────────────

export const palette = {
  // Core brand
  obsidian:   "#0A0A0F",
  void:       "#111118",
  surface:    "#16161F",
  elevated:   "#1E1E2E",
  overlay:    "#252535",
  border:     "#2A2A3E",
  borderHover:"#3A3A5C",

  // Accent — electric violet + cyan
  violet:     "#7C3AED",
  violetHover:"#8B5CF6",
  violetGlow: "rgba(124,58,237,0.35)",
  cyan:       "#22D3EE",
  cyanGlow:   "rgba(34,211,238,0.25)",
  pink:       "#EC4899",
  pinkGlow:   "rgba(236,72,153,0.25)",

  // Text
  textPrimary:   "#F1F0FF",
  textSecondary: "#9B9BC0",
  textMuted:     "#bdbdeb",
  textInverse:   "#0A0A0F",

  // Semantic
  success: "#10B981",
  warning: "#F59E0B",
  error:   "#EF4444",
  info:    "#3B82F6",

  // Gradients (as CSS strings)
  gradientPrimary:  "linear-gradient(135deg, #7C3AED 0%, #22D3EE 100%)",
  gradientSurface:  "linear-gradient(180deg, #1E1E2E 0%, #16161F 100%)",
  gradientGlow:     "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.18) 0%, transparent 70%)",
  gradientMessage:  "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 60%, #22D3EE 100%)",
} as const;

export type PaletteKey = keyof typeof palette;

// Semantic role map — use these in components instead of raw hex
export const colors = {
  bg:             palette.obsidian,
  bgSurface:      palette.surface,
  bgElevated:     palette.elevated,
  bgOverlay:      palette.overlay,

  accent:         palette.violet,
  accentHover:    palette.violetHover,
  accentGlow:     palette.violetGlow,
  accentSecondary:palette.cyan,

  border:         palette.border,
  borderHover:    palette.borderHover,

  text:           palette.textPrimary,
  textSub:        palette.textSecondary,
  textMuted:      palette.textMuted,

  userBubble:     palette.gradientMessage,
  aiBubble:       palette.elevated,

  success:        palette.success,
  warning:        palette.warning,
  error:          palette.error,
} as const;

export const lightPalette = {
  bg:             "#F5F4FF",
  bgSurface:      "#FFFFFF",
  bgElevated:     "#EEF0FF",
  bgOverlay:      "#E6E8FF",

  border:         "#D4D0F0",
  borderHover:    "#B8B2E8",

  text:           "#0A0A1A",
  textSub:        "#4A4870",
  textMuted:      "#8A88AA",

  accent:         "#7C3AED",
  accentHover:    "#6D28D9",
  accentGlow:     "rgba(124,58,237,0.2)",
  accentSecondary:"#0891B2",

  userBubble:     "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 60%, #22D3EE 100%)",
  aiBubble:       "#FFFFFF",
} as const;