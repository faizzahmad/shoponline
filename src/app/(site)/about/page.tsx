import type { Metadata } from "next";
import { Star } from "lucide-react";
import { SiteContentShell } from "../_components/site-content-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BRAND_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About us & reviews",
  description:
    "Learn about ShopOnline — shop clothes, footwear, furniture, electronics, and more in one online store.",
};

const DUMMY_REVIEWS = [
  {
    name: "John Doe",
    location: "Mumbai, IN",
    date: "March 2026",
    rating: 5,
    text: "Ordered sneakers and a desk lamp in one cart. Everything arrived neatly packed and looked exactly like the product photos.",
  },
  {
    name: "Jane Smith",
    location: "Bengaluru, IN",
    date: "February 2026",
    rating: 5,
    text: "Great mix of categories — clothes, gadgets, and home items. Checkout was smooth and support answered quickly.",
  },
  {
    name: "Priya Sharma",
    location: "Delhi, IN",
    date: "February 2026",
    rating: 4,
    text: "Filters and category browsing made it easy to find electronics and furniture pieces. Solid shopping experience overall.",
  },
  {
    name: "Alex Rivera",
    location: "Hyderabad, IN",
    date: "January 2026",
    rating: 5,
    text: "Used ShopOnline for a home refresh. Product cards were clear and delivery updates were timely.",
  },
  {
    name: "Emily Chen",
    location: "Pune, IN",
    date: "January 2026",
    rating: 5,
    text: "Fast browsing and clear product details. Loved being able to shop fashion and home essentials in the same place.",
  },
] as const;

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-4 shrink-0 ${
            i < count ? "fill-amber-400 text-amber-400" : "text-neutral-300"
          }`}
        />
      ))}
    </div>
  );
}

export default function AboutPage() {
  return (
    <SiteContentShell>
      <header>
        <h1 className="raleway text-2xl font-bold text-[#0F2744] border-b-4 border-[#0F2744] pb-3 inline-block sm:text-3xl md:text-4xl">
          About us
        </h1>
      </header>

      <div className="mt-6 exo text-neutral-700 leading-relaxed space-y-4 text-sm sm:mt-8 sm:text-[0.95rem] md:text-base">
        <p>
          {BRAND_NAME} is your online destination for clothes, footwear,
          furniture, electronics, and everyday essentials — all in one place.
          We bring together trusted products across categories so you can shop
          fashion, home, and gadgets without switching between stores.
        </p>
        <p>
          Our catalog is curated for clear photos, honest descriptions, and
          simple browsing by category. Whether you are updating your wardrobe,
          furnishing a room, or picking up a new gadget, we aim to make the
          journey smooth from browse to checkout.
        </p>
        <p>
          Thank you for shopping with {BRAND_NAME}. We are always improving our
          selection based on customer feedback and seasonal demand — and we are
          glad to be part of your next order.
        </p>
      </div>

      <section className="mt-14 md:mt-16" aria-labelledby="reviews-heading">
        <h2
          id="reviews-heading"
          className="raleway text-lg font-bold text-[#0F2744] border-b-4 border-[#0F2744] pb-3 inline-block sm:text-2xl md:text-3xl"
        >
          Reviews
        </h2>
        <p className="mt-3 exo text-xs text-neutral-600 sm:mt-4 sm:text-sm md:text-[0.95rem]">
          Recent feedback from shoppers.
        </p>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2">
          {DUMMY_REVIEWS.map((review) => (
            <li key={`${review.name}-${review.date}`}>
              <Card className="h-full border-[#0F2744]/20/80 bg-white/90 shadow-sm transition hover:shadow-md">
                <CardHeader className="space-y-2 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="raleway text-base font-semibold text-neutral-900 sm:text-lg">
                      {review.name}
                    </CardTitle>
                    <Stars count={review.rating} />
                  </div>
                  <CardDescription className="exo text-xs text-neutral-500">
                    {review.location} · {review.date}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="exo text-sm text-neutral-700 leading-relaxed">
                    {review.text}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </SiteContentShell>
  );
}
