import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
});

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Ramadan Iftar - Shared Gallery",
    description: "Scan to Capture, Share & Download Tonight’s Memories",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${playfair.variable} ${inter.variable} font-sans antialiased bg-slate-50 text-slate-900 selection:bg-blue-200 selection:text-blue-900`}
            >
                {children}
            </body>
        </html>
    );
}
