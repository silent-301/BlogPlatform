import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BlogPlatform - Share Your Stories",
  description: "A modern blog platform for authors and readers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-zinc-200 dark:border-zinc-700 py-6 mt-12">
            <div className="max-w-6xl mx-auto px-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
              BlogPlatform - Built with Next.js & MongoDB
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
