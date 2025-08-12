import Image from "next/image";
import Link from "next/link";
interface CategoriesSliderProps {
    categories: {
        id: string;
        name: string;
        img: string;
        subCategories: {
            id: string;
            name: string;
            image: string;
            }[];
    }[];
}

export const CategoriesSlider = ({categories} : CategoriesSliderProps) => {
    return (
        <div className="w-full py-5 lg:px-16 px-5 flex flex-wrap gap-5 lg:justify-between justify-center border-t-[5px] border-rose-500">
        {
            categories.map((item) => (
                  <Link href={`/shop?category=${item.id}&subcategory=${item.subCategories.map((sub) => sub.id).join(',')}`} className="flex flex-col  gap-2 items-center" key={item.id}>
                <div className="size-20 relative rounded-full overflow-hidden">
                    <Image src={item.img} alt={`${item.name}Image`} fill className=" w-full h-full object-cover"/>
                </div>
               <p className="font-[500] raleway">{item.name}</p>
            </Link>
            ))
        }
        </div>
    )
}