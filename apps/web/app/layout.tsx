import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "optional",
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
    <html lang="en" className={inter.className}>
       <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&display=optional"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col selection:bg-primary/20">
        {children}
      </body>
    </html>
  );
}
