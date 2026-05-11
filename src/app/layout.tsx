import "./globals.css";
import {
  ClerkProvider
} from '@clerk/nextjs';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from "sonner";
import { buildRootMetadata } from "@/lib/site-metadata";

export const metadata = buildRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
<link rel="manifest" href="/site.webmanifest"/>
      </head>
      <body>
        <NextTopLoader color="#244d7c" />
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
