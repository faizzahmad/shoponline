import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface SubCategory {
    _id: string;
    title: string;
    img: string;
}

interface SiteNavDropDownProps {
    subCategories: SubCategory[];
    category_id: string;
}

export const SiteNavDropDown: React.FC<SiteNavDropDownProps> = ({
    subCategories,
    category_id,
}) => {
    return (
        <div className="absolute left-0 top-[30px] z-50 hidden min-h-[50px] min-w-[min(100vw-2rem,20rem)] max-w-sm rounded-md border border-neutral-200/80 bg-white shadow-md group-hover:block">
            <ul className="max-h-[min(24rem,calc(100vh-8rem))] divide-y divide-neutral-100 overflow-y-auto overscroll-contain py-1">
                {subCategories.map((sub) => (
                    <li key={sub._id}>
                        <Link
                            className="group/row flex items-start gap-2 px-4 py-2.5 text-left text-sm leading-snug text-neutral-800 transition hover:bg-rose-50 hover:text-rose-600"
                            href={`/shop?category=${category_id}&subcategory=${sub._id}`}
                        >
                            <span className="min-w-0 flex-1">{sub.title}</span>
                            <ChevronRight
                                className="mt-0.5 size-4 shrink-0 text-rose-400 transition group-hover/row:text-rose-600 group-hover/row:opacity-100 opacity-80"
                                aria-hidden
                            />
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};
