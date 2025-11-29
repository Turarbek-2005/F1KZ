import type { Metadata } from "next";
import { cn } from "@/shared/lib/utils";
import { Header } from "@/widget/Header";
import { Providers } from "@/app/providers/Providers";
import { InitAuth } from "@/app/providers/InitAuth";
import { grapeNuts, montserrat } from "./fonts";
import "./globals.css";


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
    <html
      lang="en"
      className={`${montserrat.variable} ${grapeNuts.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body className={cn(montserrat.className, "antialiased")}>
        <Providers>
          <InitAuth />
          <Header />
          <main className="pt-16">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
