"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Loader2, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Supabase puts the session in the URL hash on redirect
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // Session is ready — user can now set a new password
      }
    });
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Redirect to chat after 2 seconds
    setTimeout(() => router.push("/"), 2000);
  };

  // ── Success state ──
  if (success) {
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
            Password updated!
          </h2>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Redirecting you to the chat…
          </p>
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
          <div
            className="relative w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "linear-gradient(135deg, #7C3AED, #22D3EE)" }}
          >
            <span className="text-white font-black text-lg">N</span>
          </div>
          <h1 className="font-bold text-xl" style={{ color: "var(--color-text)" }}>
            Set new password
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            Choose a strong password for your account
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border p-6 space-y-4"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          {/* New password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-medium" style={{ color: "var(--color-text-sub)" }}>
              New password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-lg pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all"
                style={{
                  background: "var(--color-elevated)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                style={{ color: "var(--color-text-muted)" }}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <label htmlFor="confirm" className="text-xs font-medium" style={{ color: "var(--color-text-sub)" }}>
              Confirm password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
              <input
                id="confirm"
                type={showPassword ? "text" : "password"}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your password"
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
            className="w-full !h-10 text-white font-semibold cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #8B5CF6)",
              boxShadow: "0 0 20px rgba(124,58,237,0.35)",
            }}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>Update password <ArrowRight size={14} /></>
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}