import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";

import "./globals.css";

export const metadata: Metadata = {
  title: "Thryve",
  description:
    "A unified platform that brings together everything people need to live healthier lives: expert guidance, personalized recommendations, seamless booking for wellness services, curated products, and a connected community online and in person."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
