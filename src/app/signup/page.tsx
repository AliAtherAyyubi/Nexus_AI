"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div
        className="flex h-screen items-center justify-center px-4"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, var(--color-bg) 60%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center rounded-2xl border p-8"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-4" />
          <h2 className="font-bold text-lg mb-2" style={{ color: "var(--color-text)" }}>
            Check your inbox
          </h2>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <Link href="/login" className="inline-block mt-5 text-sm font-medium text-violet-400 hover:text-violet-300">
            Back to login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, var(--color-bg) 60%)",
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
            Create your account
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            Start chatting with Nexus AI
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border p-6 space-y-4"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-medium" style={{ color: "var(--color-text-sub)" }}>
              Full name
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all"
                style={{ background: "var(--color-elevated)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium" style={{ color: "var(--color-text-sub)" }}>
              Email
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
                style={{ background: "var(--color-elevated)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-medium" style={{ color: "var(--color-text-sub)" }}>
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all"
                style={{ background: "var(--color-elevated)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
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
            style={{ background: "linear-gradient(135deg, #7C3AED, #8B5CF6)", boxShadow: "0 0 20px rgba(124,58,237,0.35)" }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <>Create account <ArrowRight size={14} /></>}
          </Button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "var(--color-text-muted)" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-violet-400 hover:text-violet-300">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
