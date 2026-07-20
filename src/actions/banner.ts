import { connectToDb } from "@/lib/connectToDb";
import Banner from "@/lib/models/banner";

export type BannerDTO = {
  _id: string;
  type: "top" | "bottom";
  link: string;
  image: string;
  mobileImage: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
};

function toBannerDTO(doc: Record<string, unknown>): BannerDTO {
  return {
    _id: String(doc._id),
    type: doc.type === "bottom" ? "bottom" : "top",
    link: typeof doc.link === "string" && doc.link ? doc.link : "/shop",
    image: String(doc.image ?? ""),
    mobileImage: typeof doc.mobileImage === "string" ? doc.mobileImage : "",
    title: typeof doc.title === "string" ? doc.title : "",
    subtitle: typeof doc.subtitle === "string" ? doc.subtitle : "",
    ctaLabel: typeof doc.ctaLabel === "string" && doc.ctaLabel ? doc.ctaLabel : "Shop now",
  };
}

export async function getBanners(type: "top" | "bottom"): Promise<BannerDTO[]> {
  try {
    await connectToDb();
    const banners = await Banner.find({ type }).sort({ createdAt: -1 }).lean();
    return banners.map((banner) => toBannerDTO(banner as Record<string, unknown>));
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
}
