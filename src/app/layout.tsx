import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scrunity CRM",
  description: "A mini CRM for tracking contacts and deals",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* Browser extensions (e.g. ColorZilla) inject attributes on <body>. */}
      <body
        className="min-h-full flex flex-col bg-muted/40"
        suppressHydrationWarning
      >
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
