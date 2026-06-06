import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Glow & Beauty Goals",
  description: "Premium Skincare and Beauty Platform",
  openGraph: {
    title: "Glow & Beauty Goals",
    description: "Discover your natural glow with our premium skincare collections.",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className="min-h-screen flex flex-col antialiased bg-primary text-text-main selection:bg-accent-blush selection:text-text-main">
        {children}
      </body>
    </html>
  );
}
