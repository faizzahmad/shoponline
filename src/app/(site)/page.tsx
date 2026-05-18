import type { Metadata } from "next";
import { CustomCarousel } from "@/components/custom/custom-carousel";
import { demoBanners } from "@/lib/staticData";
import { CategoriesSlider } from "./_components/categories-slider";
import { OfferBanner } from "./_components/offer-banner";
import { ProductSlider } from "./_components/product-slider";
import { SocialLinks } from "./_components/social-links";
import { getLatestCategories } from "@/actions/category";
import { getNewProducts, getTopSellingProducts } from "@/actions/product";
import { ProductInfoModal } from "./shop/_components/product-info-modal";
import Link from "next/link";
import Image from "next/image";
import { getActiveCoupons } from "@/actions/coupon";

type SubCategory = {
    _id: string;
    title: string;
    image: string;
};

export const metadata: Metadata = {
    title: {
        absolute: "Najak Clothing — Men's & Women's Fashion Online",
    },
    description:
        "Discover new arrivals, categories, offers, and bestsellers at Najak Clothing — contemporary men's and women's apparel shipped across India.",
    alternates: {
        canonical: "/",
    },
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
    const featuredCategories = categoriesData.slice(4, 8);
    const coupons = await getActiveCoupons(3);

    return (
        <div className="w-full pb-10">
            <ProductInfoModal />
            <CustomCarousel data={demoBanners} />
            <section className="lg:px-10 px-5 py-6 sm:py-10 bg-white animate-soft-fade-up">
                <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center">
                    <div>
                        <p className="uppercase text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] text-[#426b9a] font-semibold">
                            New season collection
                        </p>
                        <h1 className="mt-2 sm:mt-3 text-xl font-bold leading-snug raleway text-[#244d7c] sm:text-2xl md:text-4xl lg:text-5xl sm:leading-tight">
                            Redefine your everyday style with pieces built for comfort and confidence.
                        </h1>
                        <p className="mt-3 sm:mt-4 text-sm leading-relaxed text-[#426b9a] max-w-xl sm:text-base">
                            Discover fashion essentials, statement layers, and modern fits crafted to keep your wardrobe versatile from workdays to weekends.
                        </p>
                        <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-4">
                            <Link
                                href="/shop?sortBy=new"
                                className="rounded-full bg-[#244d7c] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#426b9a] sm:px-6 sm:py-3 sm:text-sm"
                            >
                                Shop new arrivals
                            </Link>
                            <Link
                                href="/shop?sortBy=top-selling"
                                className="rounded-full border border-[#244d7c]/40 px-4 py-2 text-xs font-semibold text-[#244d7c] transition hover:bg-[#eef4fb] sm:px-6 sm:py-3 sm:text-sm"
                            >
                                Best sellers
                            </Link>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 animate-soft-fade-up-delay">
                        {featuredCategories.map((item) => (
                            <Link
                                href={`/shop?category=${item.id}&subcategory=${item.subCategories.map((sub : any) => sub.id).join(",")}`}
                                key={item.id}
                                className="group relative h-32 rounded-xl overflow-hidden sm:h-40 sm:rounded-2xl"
                            >
                                <Image src={item.img} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#244d7c]/85 to-transparent" />
                                <span className="absolute bottom-2 left-2 right-2 text-[11px] font-semibold leading-tight text-white sm:bottom-3 sm:left-3 sm:right-auto sm:text-sm">
                                    {item.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
            <CategoriesSlider categories={categoriesData} />
            <OfferBanner />
            <ProductSlider carouselTitle="New Arrivals" products={newArrivals} />
            <ProductSlider carouselTitle="Best Sellers" products={bestSeller} />
            {coupons.length > 0 ? (
                <section className="lg:px-10 px-5 py-6 sm:py-8">
                    <div className="relative overflow-hidden rounded-xl border border-[#244d7c]/15 sm:rounded-2xl">
                        <Image
                            src="https://az0ocw5ei9.ufs.sh/f/aoRrknTvWVje546PtK7AKDedf8SWaILuTo5vtwB7qJNOcRki"
                            alt="coupon background"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#244d7c]/92 via-[#244d7c]/78 to-[#426b9a]/70" />
                        <div className="relative p-4 sm:p-5 md:p-7">
                            <div className="mb-4 flex items-end justify-between sm:mb-5">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75 sm:text-xs sm:tracking-[0.24em]">
                                        Limited time offers
                                    </p>
                                    <h3 className="mt-1 font-bold text-white raleway text-lg leading-snug sm:text-xl md:text-3xl">
                                        Save more with exclusive coupons
                                    </h3>
                                    <p className="mt-2 text-xs text-white/85 sm:text-sm">Pick your code and apply at checkout to unlock instant savings.</p>
                                </div>
                                <Link href="/cart" className="hidden md:inline-flex text-sm font-semibold text-white border border-white/30 rounded-full px-4 py-2 hover:bg-white/10 transition">
                                    Apply in cart
                                </Link>
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                                {coupons.map((coupon) => (
                                    <div key={coupon.id} className="rounded-lg border border-white/25 bg-white/10 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.2)] backdrop-blur-sm sm:rounded-xl sm:p-4">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70 sm:text-xs sm:tracking-[0.18em]">
                                            Special offer
                                        </p>
                                        <p className="mt-1 font-bold text-white exo text-2xl sm:text-3xl">{coupon.discountPercentage}% OFF</p>
                                        <p className="text-xs text-white/75 mt-2">Use code</p>
                                        <p className="mt-1 inline-flex items-center rounded-md bg-white/20 border border-white/35 px-3 py-1 text-sm font-bold tracking-wide text-white">
                                            {coupon.couponCode}
                                        </p>
                                        <p className="text-xs text-white/75 mt-3">
                                            Valid till {new Date(coupon.validTo).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-white/75 mt-1">{coupon.remainingCount} redemptions left</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            ) : null}
            <section className="lg:px-10 px-5 py-8 sm:py-12">
                <div className="grid gap-3 md:grid-cols-3 md:gap-4">
                    <div className="animate-soft-fade-up rounded-xl bg-[#244d7c] p-4 text-white sm:rounded-2xl sm:p-6">
                        <h3 className="text-lg font-semibold raleway sm:text-xl">Premium fabrics</h3>
                        <p className="mt-2 text-sm text-white/85 sm:text-base">Soft, durable materials selected for daily wear and long-lasting comfort.</p>
                    </div>
                    <div className="animate-soft-fade-up-delay rounded-xl bg-[#426b9a] p-4 text-white sm:rounded-2xl sm:p-6">
                        <h3 className="text-lg font-semibold raleway sm:text-xl">Fast shipping</h3>
                        <p className="mt-2 text-sm text-white/85 sm:text-base">Quick order dispatch so your style upgrades arrive right on time.</p>
                    </div>
                    <div className="animate-slow-float rounded-xl border border-[#244d7c]/20 bg-white p-4 sm:rounded-2xl sm:p-6">
                        <h3 className="text-lg font-semibold raleway text-[#244d7c] sm:text-xl">Easy returns</h3>
                        <p className="mt-2 text-sm text-[#426b9a] sm:text-base">Shop with confidence thanks to hassle-free returns and support.</p>
                    </div>
                </div>
            </section>
            <SocialLinks />
        </div>
    );
}
