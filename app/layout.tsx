import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ChatWidget } from "@/components/ai/ChatWidget";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Meridian",
  description:
    "Set budgets that actually block calls. Meter usage your customers can audit. Bill them for it automatically.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}>
        <Providers>
          {children}
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
