import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google"; // Changed to more standard google fonts for better control
import "./globals.css";
import { AudioProvider } from './hooks/useAudio';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "The House",
  description: "A horror experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans bg-black text-gray-200 antialiased overflow-hidden h-screen`}
      >
        <AudioProvider>
          {children}
        </AudioProvider>
      </body>
    </html>
  );
}
