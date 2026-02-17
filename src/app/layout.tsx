import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-WW1CX4X73W"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-WW1CX4X73W');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
