import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import "./globals.css";
import { Toaster } from "sonner";
import { Header } from "@/components/Header";
import Providers from "@/components/providers";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthGate } from "@/app/(auth)/AuthGate";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Educational Center",
    description: "Student score tracking and management platform",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const locale = await getLocale();

    return (
        <html
            lang={locale}
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
            suppressHydrationWarning
        >
            <body className="min-h-full flex flex-col bg-background text-foreground">
                <NextIntlClientProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <Providers>
                            <Header />
                            <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6">
                                <AuthGate>{children}</AuthGate>
                            </main>
                        </Providers>
                        <Toaster richColors position="top-center" closeButton />
                    </ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
