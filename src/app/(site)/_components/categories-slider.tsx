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

export const CategoriesSlider = ({ categories }: CategoriesSliderProps) => {
    return (
        <div className="w-full py-6 lg:px-16 px-5 flex flex-wrap gap-5 lg:justify-between justify-center border-t-[3px] border-[#0F2744]/25 bg-white">
            {categories.map((item) => (
                <Link
                    href={`/shop?category=${item.id}&subcategory=${item.subCategories.map((sub) => sub.id).join(",")}`}
                    className="group flex flex-col gap-2 items-center"
                    key={item.id}
                >
                    <div className="size-20 relative rounded-full overflow-hidden ring-2 ring-[#1B3F66]/20 transition-all duration-300 group-hover:ring-[#0F2744]/50 group-hover:scale-105">
                        <Image src={item.img} alt={`${item.name}Image`} fill className="w-full h-full object-cover" />
                    </div>
                    <p className="max-w-[5.5rem] text-center text-[11px] font-[600] leading-tight text-[#0F2744] raleway sm:max-w-none sm:text-sm">
                        {item.name}
                    </p>
                </Link>
            ))}
        </div>
    );
};
