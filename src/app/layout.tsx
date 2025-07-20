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
  title: "GitHub Galary – Futuristic GitHub Avatar Gallery",
  description: "Discover random GitHub avatars, explore user details, and filter by stars, followers, and more. Built with Next.js, React, Tailwind CSS, and the GitHub API.",
  keywords: [
    "GitHub",
    "avatar",
    "gallery",
    "Next.js",
    "React",
    "Tailwind CSS",
    "GitHub API",
    "open source",
    "developer",
    "profile"
  ],
  openGraph: {
    title: "GitHub Galary – Futuristic GitHub Avatar Gallery",
    description: "Discover random GitHub avatars, explore user details, and filter by stars, followers, and more.",
    url: "https://git-galary.vercel.app", // Update if you deploy elsewhere
    siteName: "GitHub Galary",
    images: [
      {
        url: "https://github.com/HarshYadav152/git-galary/blob/main/git-galary.png?raw=true",
        width: 1200,
        height: 630,
        alt: "GitHub Galary – Futuristic GitHub Avatar Gallery"
      }
    ],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "GitHub Galary – Futuristic GitHub Avatar Gallery",
    description: "Discover random GitHub avatars, explore user details, and filter by stars, followers, and more.",
    images: ["https://github.com/HarshYadav152/git-galary/blob/main/git-galary.png?raw=true"],
    creator: "@HarshYadav_152"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
