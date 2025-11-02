"use client";

import { ThemeProvider } from "next-themes";
import { StoreProvider } from "./StoreProvider";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <ThemeProvider attribute="class" enableSystem defaultTheme="dark">
        {children}
      </ThemeProvider>
    </StoreProvider>
  );
}
