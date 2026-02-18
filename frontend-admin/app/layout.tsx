// frontend-admin/app/layout.tsx
import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import "./styles/theme.css";
import { AuthProvider } from "./context/AuthContext"; 

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Alpha Core | Quantitative Trading Terminal",
  description: "Next-gen algorithmic trading interface",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <div className="angel-bg">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}