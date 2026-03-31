"use client";

import { ThemeProvider } from "@/components/theme-provider";
import React from "react";

export function ClientThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}
        </ThemeProvider>
    );
}