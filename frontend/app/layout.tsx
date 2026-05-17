import type { Metadata } from "next";
import { Lora, Host_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "sonner";

const lora = Lora({
  variable: "--font-title",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const hostGrotesk = Host_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LIFE",
  description: "Figure out what you want.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lora.variable} ${hostGrotesk.variable} antialiased`}
      >
        <Navbar />
        {children}
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--color-surface)",
              color: "var(--color-fg)",
              border: "1px solid var(--color-border)",
              borderRadius: "1rem",
              fontFamily: "var(--font-sans)",
              fontSize: "0.875rem",
            },
          }}
        />
      </body>
    </html>
  );
}
