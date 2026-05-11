import type { Metadata } from "next";

/** Canonical site origin for Open Graph and metadataBase (set NEXT_PUBLIC_API_URL in production). */
export function getMetadataBase(): URL | undefined {
    const raw =
        process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "") ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
    if (!raw) return undefined;
    try {
        return new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    } catch {
        return undefined;
    }
}

const defaultDescription =
    "Shop men's and women's apparel and accessories — contemporary everyday style from Najak Clothing, shipped across India.";

export function buildRootMetadata(): Metadata {
    const metadataBase = getMetadataBase();
    const ogImage = "/images/web/logo.png";

    return {
        metadataBase: metadataBase ?? undefined,
        title: {
            default: "Najak Clothing",
            template: "%s | Najak Clothing",
        },
        description: defaultDescription,
        keywords: [
            "Najak Clothing",
            "najak clothing",
            "clothing India",
            "online apparel",
            "men's clothing",
            "women's clothing",
            "fashion",
        ],
        authors: [{ name: "Najak Clothing" }],
        robots: { index: true, follow: true },
        openGraph: {
            title: "Najak Clothing",
            description: defaultDescription,
            siteName: "Najak Clothing",
            locale: "en_IN",
            type: "website",
            ...(metadataBase ? { url: new URL("/", metadataBase).toString() } : {}),
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: "Najak Clothing",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: "Najak Clothing",
            description: defaultDescription,
            images: [ogImage],
        },
    };
}
