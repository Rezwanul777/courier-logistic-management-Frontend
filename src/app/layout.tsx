import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import Providers from "@/providers";

import { Toaster } from "sonner";

import {
  AuthSuccessToast,
} from "@/component/auth/auth-success-toast";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "CourierFlow",
    template: "%s | CourierFlow",
  },
  description:
    "Book, pay for, and track courier shipments.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Providers>{children}</Providers>
          <AuthSuccessToast />

  <Toaster
    position="top-right"
    richColors
    closeButton
    duration={4500}
    visibleToasts={3}
  />
      </body>
    </html>
  );
}
