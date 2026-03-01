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
    title: "Ramadan Kareem - Shared Gallery",
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
                className={`${playfair.variable} ${inter.variable} font-sans antialiased bg-[#2a0a2f] text-slate-100 selection:bg-[#facc15] selection:text-[#2a0a2f]`}
            >
                {children}
            </body>
        </html>
    );
}
