import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aicanfeel-offline.globalgupta14.chatgpt.site"),
  title: {
    default: "AICANFEEL — Put your brand out there.",
    template: "%s — AICANFEEL",
  },
  description:
    "Ten real-world brand campaigns in New York and London. Explore the creative, choose your format, and book a filmed activation. Real people. Real places. Real footage.",
  openGraph: {
    title: "AICANFEEL — Put your brand out there.",
    description:
      "Book a real-world campaign. Every activation comes with a filmmaker, cinematic edits and scheduled Instagram Live.",
    type: "website",
    images: [
      {
        url: "/campaigns/street-runway/01.webp",
        width: 1200,
        height: 800,
        alt: "AICANFEEL Street Runway campaign concept",
      },
    ],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
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
        <meta name="referrer" content="no-referrer" />
        <link
          rel="preload"
          href="/fonts/mono.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/display.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
