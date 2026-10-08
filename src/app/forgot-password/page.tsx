"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${siteUrl}/reset-password`,
});

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  // ── Success state ──
  if (sent) {
    return (
      <div
        className="flex h-screen items-center justify-center px-4"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, var(--color-bg) 60%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center rounded-2xl border p-8"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(16,185,129,0.12)" }}
          >
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>
          <h2 className="font-bold text-lg mb-2" style={{ color: "var(--color-text)" }}>
            Check your inbox
          </h2>
          <p className="text-sm mb-1" style={{ color: "var(--color-text-muted)" }}>
            We sent a password reset link to
          </p>
          <p className="text-sm font-semibold mb-6" style={{ color: "var(--color-text)" }}>
            {email}
          </p>
          <p className="text-xs mb-6" style={{ color: "var(--color-text-muted)" }}>
            Click the link in the email to reset your password. The link expires in 1 hour.
          </p>
          <button
            onClick={() => setSent(false)}
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            Resend email
          </button>
          <div className="mt-4">
            <Link href="/login" className="text-xs font-medium text-violet-400 hover:text-violet-300">
              Back to login
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Form state ──
  return (
    <div
      className="flex h-screen items-center justify-center px-4"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, var(--color-bg) 60%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="relative w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "linear-gradient(135deg, #7C3AED, #22D3EE)" }}
          >
            <span className="text-white font-black text-lg">N</span>
            <div
              className="absolute inset-0 rounded-2xl blur-md opacity-60 -z-10"
              style={{ background: "linear-gradient(135deg, #7C3AED, #22D3EE)" }}
            />
          </motion.div>
          <h1 className="font-bold text-xl" style={{ color: "var(--color-text)" }}>
            Reset your password
          </h1>
          <p className="text-sm mt-1 text-center" style={{ color: "var(--color-text-muted)" }}>
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border p-6 space-y-4"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium" style={{ color: "var(--color-text-sub)" }}>
              Email address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all"
                style={{
                  background: "var(--color-elevated)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs rounded-lg px-3 py-2"
              style={{ color: "#FCA5A5", background: "rgba(239,68,68,0.3)" }}
            >
              {error}
            </motion.p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10! text-white font-semibold cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #8B5CF6)",
              boxShadow: "0 0 20px rgba(124,58,237,0.35)",
            }}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>Send reset link <ArrowRight size={14} /></>
            )}
          </Button>
        </form>

        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 mt-6 text-sm transition-colors"
          style={{ color: "var(--color-text-muted)" }}
        >
          <ArrowLeft size={13} />
          Back to login
        </Link>
      </motion.div>
    </div>
  );
}