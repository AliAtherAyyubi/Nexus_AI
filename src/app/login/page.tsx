"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

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
              style={{
                background: "linear-gradient(135deg, #7C3AED, #22D3EE)",
              }}
            />
          </motion.div>
          <h1
            className="font-bold text-xl"
            style={{ color: "var(--color-text)" }}
          >
            Welcome back
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            Sign in to continue to Nexus AI
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border p-6 space-y-4"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-xs font-medium"
              style={{ color: "var(--color-text-sub)" }}
            >
              Email
            </label>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--color-text-muted)" }}
              />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all"
                style={{
                  background: "var(--color-hover-bg, var(--color-elevated))",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-xs font-medium"
                style={{ color: "var(--color-text-sub)" }}
              >
                Password
              </label>
              
            </div>
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--color-text-muted)" }}
              />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all"
                style={{
                  background: "var(--color-hover-bg, var(--color-elevated))",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
              />
              
            </div>
            <Link
                href="/forgot-password"
                className="text-[11px] font-medium text-violet-700 hover:text-violet-400 transition-colors"
              >
                Forgot password?
              </Link>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs rounded-lg px-3 py-2"
              style={{ color: "#FCA5A5", background: "rgba(239,68,68,0.1)" }}
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
              <>
                Sign in <ArrowRight size={14} />
              </>
            )}
          </Button>
        </form>

        <p
          className="text-center text-sm mt-6"
          style={{ color: "var(--color-text-muted)" }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-violet-400 hover:text-violet-300"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
