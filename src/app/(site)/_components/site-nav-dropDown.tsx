import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface SubCategory {
    _id: string;
    title: string;
    img : string;
    
}

interface SiteNavDropDownProps {
    subCategories: SubCategory[];
    category_id : string;

}

export const SiteNavDropDown: React.FC<SiteNavDropDownProps> = ({ subCategories,category_id }) => {
    return (
        <div className="top-[30px] group-hover:block hidden left-0 absolute min-w-72  max-w-80 bg-white border shadow-sm rounded-md min-h-[50px] max-h-[400px] z-50">
            <ul className="p-5 text-black w-full grid grid-cols-2 gap-y-4 gap-x-10">
                {subCategories.map((subCategories) => (
                    <li key={subCategories._id} className="transition text-sm">
                        <Link className="flex items-center gap-3 transition hover:text-rose-600" href={
                            `/shop?category=${category_id}&subcategory=${subCategories._id}`
                        }>{subCategories.title}
                            <ChevronRight className="size-[14px]" />
                        </Link>

                    </li>
                ))}
            </ul>
        </div>

    );
}