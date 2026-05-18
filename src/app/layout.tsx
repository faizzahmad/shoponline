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
