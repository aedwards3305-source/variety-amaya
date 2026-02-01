import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Variety Amaya LLC | General Contractor in Fairfax County, VA",
  description: "Your trusted general laborer in Fairfax County, VA. We offer remodeling, plumbing, electrical, landscaping, painting, and more. Licensed and insured. Free estimates!",
  keywords: "general contractor, Fairfax VA, remodeling, landscaping, plumbing, electrical, painting, home services, Variety Amaya",
  openGraph: {
    title: "Variety Amaya LLC | General Contractor in Fairfax County, VA",
    description: "Your trusted general laborer in Fairfax County, VA. Licensed and insured with free estimates.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
