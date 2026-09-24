import type { Metadata } from "next";
import { Poppins, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import ClientWrapper from "@/components/clientWrapper"; 

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

// ✅ Inject theme before paint to avoid flash
const themeInitScript = `
(function() {
  try {
    var t = localStorage.getItem('nexus-theme');
    if (t !== 'light' && t !== 'dark') {
      t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export const metadata: Metadata = {
  title: "Nexus AI — Intelligent Chat",
  description: "Your intelligent AI assistant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn("h-full", poppins.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className={`h-full antialiased ${poppins.className}`}>
        {/* Theme init runs before hydration to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />

        {/* ✅ ClientWrapper handles splash screen + auth redirect */}
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
