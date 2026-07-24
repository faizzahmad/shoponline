import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { CartCount } from "./cart-count";
import { BrandLogo } from "@/components/custom/brand-logo";

const MobileSidebar = async () => {
    const externalUser = await currentUser();
    return (
        <div>
            <div className="flex items-center justify-between">
                <Link href="/" className="shrink-0">
                    <BrandLogo width={130} className="w-[120px] sm:w-[130px]" />
                </Link>
                <div className="flex items-center gap-4 text-[#0F2744]">
                    <Link
                        href="/search"
                        className="flex cursor-pointer flex-col items-center justify-center gap-1 transition hover:text-[#1B3F66]"
                    >
                        <SearchIcon className="size-5" />
                        <span className="text-xs font-semibold">Search</span>
                    </Link>
                    <div className="flex cursor-pointer flex-col items-center justify-center gap-1 transition hover:text-[#1B3F66]">
                        <CartCount userEmail={externalUser?.primaryEmailAddress?.emailAddress} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileSidebar;
