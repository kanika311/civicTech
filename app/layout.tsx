import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/components/ReduxProvider";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import RoleSwitcher from "@/components/common/RoleSwitcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CivicTrack — Universal Government Grievance Redressal",
  description:
    "Universal grievance reporting across 10 government departments with AR spatial evidence capture, 3D VR command-center, and automated SLA escalation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-200`}
      >
        <ThemeProvider>
          <ReduxProvider>
            <RoleSwitcher />
            {children}
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
