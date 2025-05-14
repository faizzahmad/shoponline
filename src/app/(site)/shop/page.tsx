import { getLatestCategories } from "@/actions/category";
import { ShopSidebar } from "./_components/shop-sidebar";
import { ShopPage } from "./_components/shop-page";

const Shop = async() => {
 const categories = await getLatestCategories(50);
 const categoriesData = categories.map((category) => ({
    id: category._id.toString(),
    name: category.title,
    img: category.image,
    subCategories: category.subCategories?.map((sub: any) => ({
    id: sub._id.toString(),
    name: sub.title,
    img: sub.image,
  })) || [],
  }));
    return ( 
        <div className="w-full flex gap-5">
           <div className="w-64 h-screen border-r p-5 overflow-y-auto">
            <ShopSidebar categories={categoriesData}/>
           </div>
           <div className="flex-1 h-screen overflow-y-auto p-5">
            <ShopPage/>
           </div>
        </div>
     );
}
 
export default Shop;