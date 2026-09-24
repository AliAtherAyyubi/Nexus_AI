"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr"; 
import SplashScreen from "@/components/SplashScreen";

const AUTH_PAGES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [splashDone, setSplashDone] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSplashDone = async () => {
    // ✅ Create browser client inline — avoids any server-side imports
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    const { data: { user } } = await supabase.auth.getUser();

    setSplashDone(true);

    const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

    if (user && isAuthPage) {
      router.push("/");
    } else if (!user && !isAuthPage) {
      router.push("/login");
    }
  };

  return (
    <>
      {!splashDone && <SplashScreen onDone={handleSplashDone} />}
      <div style={{ visibility: splashDone ? "visible" : "hidden", height: "100%" }}>
        {children}
      </div>
    </>
  );
}