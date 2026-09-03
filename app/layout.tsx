import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-sans'
});

export const metadata: Metadata = {
  title: "UAchieve First Aid",
  description: "Accredited first aid training for a safer workplace. HSE-recommended courses in Bedfordshire.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} h-full antialiased`}
    >
      <head>
        {/* Start cookieyes banner */}
        <Script
          id="cookieyes"
          src="https://cdn-cookieyes.com/client_data/8ded0e342b0e7016f7cbb43d8b358e67/script.js"
          strategy="beforeInteractive"
        />
        {/* End cookieyes banner */}
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}