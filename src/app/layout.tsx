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
  title: "Monad Chef - Ultra-fast Blockchain Kitchen",
  description: "Watch blockchain transactions transform into delicious dishes at 500ms block speeds",
  icons: {
    icon: '/favicon.svg',
    apple: '/monad-chef-logo.svg'
  },
  metadataBase: new URL('https://monad-chef.vercel.app'),
  openGraph: {
    title: 'Monad Chef - Ultra-fast Blockchain Kitchen',
    description: 'Watch blockchain transactions transform into delicious dishes at 500ms block speeds',
    images: ['/monad-chef-logo.svg'],
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
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/monad-chef-logo.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
