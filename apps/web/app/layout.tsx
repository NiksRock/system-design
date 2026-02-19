import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Providers from "./providers";
import { Inter } from "next/font/google";
const inter = Inter({
  subsets: ["latin"],
});
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "GDriveBridge",
  description: "Cloud transfer system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* 🔥 ADD THIS */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.className} bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display selection:bg-primary/20`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
