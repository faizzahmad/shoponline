import "./globals.css";
import {
  ClerkProvider
} from '@clerk/nextjs';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from "sonner";
import { buildRootMetadata } from "@/lib/site-metadata";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

/** Body / UI — same family Flipkart & Nykaa use for readable commerce UI */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/** Headings / prices / CTAs — premium geometric sans (Myntra / D2C style) */
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata = buildRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${plusJakarta.variable} font-sans antialiased`}>
        <NextTopLoader color="#212121" />
        <ClerkProvider appearance={{ layout: { unsafe_disableDevelopmentModeWarnings: true } }}>
          <NuqsAdapter>
            <Toaster/>
            {children}
          </NuqsAdapter>
        </ClerkProvider>
      </body>
    </html>
  );
}
