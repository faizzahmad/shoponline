import type { Metadata } from "next";

export const BRAND_NAME = "Najak Clothing";

export const BRAND_DESCRIPTION =
    "Shop men's and women's apparel at Najak Clothing — contemporary everyday style, jeans, t-shirts, ethnic wear and more, shipped across India.";

export const BRAND_KEYWORDS = [
    "Najak Clothing",
    "najak clothing",
    "najakclothing",
    "clothing India",
    "online apparel",
    "men's clothing",
    "women's clothing",
    "women's fashion",
    "men's fashion",
    "buy clothes online India",
];

/** Canonical site origin for Open Graph, sitemap, and metadataBase (set NEXT_PUBLIC_API_URL in production). */
export function getSiteUrl(): string {
    const raw =
        process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "") ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
    if (!raw) return "https://www.najakclothing.com";
    try {
        const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
        return url.origin;
    } catch {
        return "https://www.najakclothing.com";
    }
}

export function getMetadataBase(): URL {
    return new URL(getSiteUrl());
}

export function buildRootMetadata(): Metadata {
    const metadataBase = getMetadataBase();
    const ogImage = "/images/web/logo.png";

    return {
        metadataBase,
        title: {
            default: BRAND_NAME,
            template: `%s | ${BRAND_NAME}`,
        },
        description: BRAND_DESCRIPTION,
        keywords: BRAND_KEYWORDS,
        authors: [{ name: BRAND_NAME }],
        creator: BRAND_NAME,
        publisher: BRAND_NAME,
        robots: { index: true, follow: true },
        icons: {
            icon: [
                { url: "/favicon.ico", sizes: "any" },
                { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
                { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
            ],
            apple: [
                {
                    url: "/apple-touch-icon.png",
                    sizes: "180x180",
                    type: "image/png",
                },
            ],
            shortcut: "/favicon.ico",
        },
        manifest: "/site.webmanifest",
        openGraph: {
            title: BRAND_NAME,
            description: BRAND_DESCRIPTION,
            siteName: BRAND_NAME,
            locale: "en_IN",
            type: "website",
            url: metadataBase.origin,
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: BRAND_NAME,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: BRAND_NAME,
            description: BRAND_DESCRIPTION,
            images: [ogImage],
        },
    };
}

/** Pages that should not appear in Google (utility / auth / mobile-only search). */
export const NOINDEX_METADATA: Metadata = {
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};
