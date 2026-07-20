import type { Metadata } from "next";
import { getProductBySlug } from "@/actions/product";
import { ProductData } from "../_components/product-data";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    try {
        const product = (await getProductBySlug(slug)) as {
            productName?: string;
            shortDescription?: string;
            images?: string[];
        };
        const name = product.productName?.trim() || "Product";
        const desc = (
            product.shortDescription?.trim() || `Shop ${name} at ShopOnline.`
        ).slice(0, 160);
        const firstImage = product.images?.[0];
        return {
            title: name,
            description: desc,
            openGraph: {
                title: name,
                description: desc,
                ...(firstImage ? { images: [{ url: firstImage, alt: name }] } : {}),
            },
            twitter: {
                card: "summary_large_image",
                title: name,
                description: desc,
                ...(firstImage ? { images: [firstImage] } : {}),
            },
        };
    } catch {
        return {
            title: "Product",
            robots: { index: false, follow: true },
        };
    }
}

const ProductPage = async ({
    params,
}: {
    params: Promise<{ slug: string }>;
}) => {
    const { slug } = await params;

    return (
        <div className="w-full">
            <ProductData slug={slug} />
        </div>
    );
};

export default ProductPage;



