import { CustomCarousel } from "@/components/custom/custom-carousel";
import { demoBanners } from "@/lib/staticData";
import { CategoriesSlider } from "./_components/categories-slider";
import { OfferBanner } from "./_components/offer-banner";
import { ProductSlider } from "./_components/product-slider";
import { SocialLinks } from "./_components/social-links";
import { getLatestCategories } from "@/actions/category";
import { getNewProducts, getTopSellingProducts } from "@/actions/product";
import { ProductInfoModal } from "./shop/_components/product-info-modal";

type SubCategory = {
    _id: string;
    title: string;
    image: string;
};

export default async function Home() {
    const categories = await getLatestCategories(10);
    const categoriesData = categories.map((category) => ({
        id: category._id,
        name: category.title,
        img: category.image,
        subCategories: category.subCategories.map((sub: SubCategory) => ({
            id: sub._id,
            name: sub.title,
            image: sub.image,
        })),
    }));
    const newArrivals = await getNewProducts(10);
    const bestSeller = await getTopSellingProducts(10);

    return (
        <div className="w-full">
            <ProductInfoModal />
            <CustomCarousel data={demoBanners} />
            <CategoriesSlider categories={categoriesData} />
            <OfferBanner />
            <ProductSlider carouselTitle="New Arrivals" products={newArrivals} />
            <ProductSlider carouselTitle="Beset Seller" products={bestSeller} />
            <SocialLinks />
        </div>
    );
}
