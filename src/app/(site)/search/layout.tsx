import type { Metadata } from "next";
import { getMetadataBase, NOINDEX_METADATA } from "@/lib/site-metadata";

export const metadata: Metadata = {
    title: "Search",
    description: "Search ShopOnline products by name or keyword.",
    ...NOINDEX_METADATA,
    alternates: {
        canonical: new URL("/shop", getMetadataBase()).toString(),
    },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
