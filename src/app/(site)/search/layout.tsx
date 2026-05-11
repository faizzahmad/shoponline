import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Search",
    description: "Search Najak Clothing products by name or keyword.",
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
