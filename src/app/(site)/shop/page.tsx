import { getLatestCategories } from "@/actions/category";
import { ShopSidebar } from "./_components/shop-sidebar";
import { ShopPage } from "./_components/shop-page";

interface SubCategory {
  _id: string;
  title: string;
  image: string;
}


const Shop = async() => {
 const categories = await getLatestCategories(50);
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
        <div className="w-full flex gap-5">
           <div className="w-64 h-screen border-r p-5 overflow-y-auto hidden md:block">
            <ShopSidebar categories={categoriesData}/>
           </div>
           <div className="flex-1 h-screen overflow-y-auto p-5">
            <ShopPage/>
           </div>
        </div>
     );
}
 
export default Shop;