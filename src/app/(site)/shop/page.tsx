import type { Metadata } from "next";
import { getOldestCategories } from "@/actions/category";

export const metadata: Metadata = {
    title: "Shop",
    description:
        "Browse men's and women's clothing by category and filters. Shop Najak Clothing online with secure checkout and delivery across India.",
};
import { ShopSidebar } from "./_components/shop-sidebar";
import { ShopPage } from "./_components/shop-page";

interface SubCategory {
  _id: string;
  title: string;
  image: string;
}


const Shop = async() => {
 const categories = await getOldestCategories(50);
const categoriesData = categories.map((category) => ({
  id: category._id.toString(),
  name: category.title,
  img: category.image,
  subCategories: category.subCategories?.map((sub: SubCategory) => ({
    id: sub._id.toString(),
    name: sub.title,
    img: sub.image,
  })) || [],
}));
    return ( 
        <div className="flex w-full min-w-0 gap-5">
           <div className="hidden h-screen w-64 shrink-0 overflow-y-auto border-r p-5 md:block">
            <ShopSidebar categories={categoriesData}/>
           </div>
           {/* Mobile: one scroll on #site-scroll-root (no nested h-screen). md+: pane scrolls beside sidebar. */}
           <div className="min-w-0 w-full flex-1 p-5 md:h-screen md:overflow-y-auto md:overflow-x-hidden">
            <ShopPage categories={categoriesData} />
           </div>
        </div>
     );
}
 
export default Shop;