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

export const metadata: Metadata = {
  title: "About us & reviews",
  description:
    "Learn about Najak Clothing and read what customers say about our apparel, quality, and service.",
};

const DUMMY_REVIEWS = [
  {
    name: "Sarah M.",
    location: "New York, NY",
    date: "March 2026",
    rating: 5,
    text: "Ordered balloons and a banner for my daughter’s birthday. Everything arrived on time and looked exactly like the photos. Will shop again!",
  },
  {
    name: "James K.",
    location: "Austin, TX",
    date: "February 2026",
    rating: 5,
    text: "Great selection of themed tableware. Checkout was smooth and customer support answered my sizing question within a few hours.",
  },
  {
    name: "Priya S.",
    location: "Chicago, IL",
    date: "February 2026",
    rating: 4,
    text: "Solid quality for the price. One item was back-ordered but they notified me early and offered a substitute that worked perfectly.",
  },
  {
    name: "Daniel R.",
    location: "Seattle, WA",
    date: "January 2026",
    rating: 5,
    text: "Used Buyora for our office holiday party. Bulk packs were well packaged and the rose-gold accents matched our branding.",
  },
  {
    name: "Emily T.",
    location: "Miami, FL",
    date: "January 2026",
    rating: 5,
    text: "Fast shipping and easy returns process. The photo booth props were a hit—guests are still talking about the party.",
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
        <h1 className="raleway text-2xl font-bold text-[#244d7c] border-b-4 border-[#244d7c] pb-3 inline-block sm:text-3xl md:text-4xl">
          About us
        </h1>
      </header>

      <div className="mt-6 exo text-neutral-700 leading-relaxed space-y-4 text-sm sm:mt-8 sm:text-[0.95rem] md:text-base">
        <p>
          Buyora is your online destination for party supplies, decorations, and
          essentials that help you celebrate without the stress. We curate
          products for birthdays, holidays, baby showers, and corporate events so
          you can focus on the people—not the logistics.
        </p>
        <p>
          Our team works with trusted suppliers to offer a mix of trending themes
          and everyday staples, with clear photos and descriptions so you know
          what you are ordering. We are always improving our catalog based on
          customer feedback and seasonal demand.
        </p>
        <p>
          Whether you are planning a small gathering or a large celebration, we
          aim to make shopping simple: browse by category, compare options, and
          check out securely. Thank you for letting us be part of your special
          moments.
        </p>
      </div>

      <section className="mt-14 md:mt-16" aria-labelledby="reviews-heading">
        <h2
          id="reviews-heading"
          className="raleway text-lg font-bold text-[#244d7c] border-b-4 border-[#244d7c] pb-3 inline-block sm:text-2xl md:text-3xl"
        >
          Reviews
        </h2>
        <p className="mt-3 exo text-xs text-neutral-600 sm:mt-4 sm:text-sm md:text-[0.95rem]">
          Recent feedback from shoppers (sample data for demonstration).
        </p>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2">
          {DUMMY_REVIEWS.map((review) => (
            <li key={`${review.name}-${review.date}`}>
              <Card className="h-full border-[#244d7c]/20/80 bg-white/90 shadow-sm transition hover:shadow-md">
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
