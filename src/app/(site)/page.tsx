import { CustomCarousel } from "@/components/custom/custom-carousel";
import { demoBanners, demoNewArrivals } from "@/lib/staticData";
import { CategoriesSlider } from "./_components/categories-slider";
import { OfferBanner } from "./_components/offer-banner";
import { ProductSlider } from "./_components/product-slider";
import { demoBestSellers } from "@/lib/staticData";
import { SocialLinks } from "./_components/social-links";
import { getLatestCategories } from "@/actions/category";



export default async function Home() {
const categories = await getLatestCategories(10);
 const categoriesData = categories.map((category) => ({
    id: category._id,
    name: category.title,
    img: category.image,
  }));

  return (
    <div className="w-full">
   <CustomCarousel data={demoBanners}/>
   <CategoriesSlider categories={categoriesData} />
   <OfferBanner/>
   <ProductSlider carouselTitle="New Arrivals" products={demoNewArrivals}/>
   <ProductSlider carouselTitle="Beset Seller" products={demoBestSellers}/>
   <SocialLinks/>
    </div>
  );
}
