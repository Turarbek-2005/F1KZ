import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/shared/lib/utils";
import { Header } from "@/widget/Header";
import { Providers } from "@/app/providers/Providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "F1KZ",
  description: "Developed by kab_desh",
  icons: {
    icon: "/F1KZ logo.png", 
    shortcut: "/F1KZ logo.png",
    apple: "/F1KZ logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={cn(inter.className, "antialiased")}>
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
