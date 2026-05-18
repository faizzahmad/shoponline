import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-metadata";

export default function sitemap(): MetadataRoute.Sitemap {
    const siteUrl = getSiteUrl();
    const lastModified = new Date();

    return [
        {
            url: siteUrl,
            lastModified,
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${siteUrl}/shop`,
            lastModified,
            changeFrequency: "daily",
            priority: 0.95,
        },
        {
            url: `${siteUrl}/about`,
            lastModified,
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${siteUrl}/policies`,
            lastModified,
            changeFrequency: "yearly",
            priority: 0.4,
        },
        {
            url: `${siteUrl}/terms`,
            lastModified,
            changeFrequency: "yearly",
            priority: 0.4,
        },
    ];
}
