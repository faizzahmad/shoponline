"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadDropzone } from "@/utils/uploadthing";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import { Loader2, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type ReviewItem = {
    _id: string;
    authorName: string;
    authorUserId: string;
    rating: number;
    text: string;
    images: string[];
    createdAt: string;
};

function StarsDisplay({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={cn(
                        "h-4 w-4 sm:h-5 sm:w-5",
                        i < rating ? "fill-amber-400 text-amber-400" : "fill-neutral-200 text-neutral-200"
                    )}
                />
            ))}
        </div>
    );
}

function StarPicker({
    value,
    onChange,
}: {
    value: number;
    onChange: (n: number) => void;
}) {
    const [hover, setHover] = useState(0);
    const show = hover || value;
    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
                const n = i + 1;
                return (
                    <button
                        key={n}
                        type="button"
                        className="p-0.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                        onMouseEnter={() => setHover(n)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => onChange(n)}
                        aria-label={`${n} stars`}
                    >
                        <Star
                            className={cn(
                                "h-8 w-8 transition-colors",
                                n <= show ? "fill-amber-400 text-amber-400" : "fill-neutral-200 text-neutral-200"
                            )}
                        />
                    </button>
                );
            })}
        </div>
    );
}

export function ProductReviewsSection({ productId }: { productId: string }) {
    const { isSignedIn, isLoaded, user } = useUser();
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [rating, setRating] = useState(5);
    const [text, setText] = useState("");
    const [images, setImages] = useState<string[]>([]);

    const load = useCallback(async () => {
        if (!productId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setReviews(data.reviews ?? []);
            setAverageRating(data.averageRating ?? 0);
            setReviewCount(data.reviewCount ?? 0);
        } catch {
            toast.error("Could not load reviews");
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        if (!user?.id || !reviews.length) return;
        const mine = reviews.find((r) => r.authorUserId === user.id);
        if (mine) {
            setRating(mine.rating);
            setText(mine.text);
            setImages(mine.images ?? []);
        }
    }, [reviews, user?.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isSignedIn) {
            toast.error("Sign in to post a review");
            return;
        }
        if (text.trim().length < 4) {
            toast.error("Please write a few words about this product.");
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId,
                    rating,
                    text: text.trim(),
                    images,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to save");
            }
            toast.success(data.message ?? "Thanks for your review!");
            setText("");
            setImages([]);
            setRating(5);
            await load();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Could not save review");
        } finally {
            setSubmitting(false);
        }
    };

    const myReview = user?.id ? reviews.find((r) => r.authorUserId === user.id) : undefined;

    return (
        <section className="mt-14 border-t border-neutral-200 pt-10">
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-neutral-900 exo">Customer reviews</h2>
                    <p className="mt-1 text-sm text-neutral-600 raleway">
                        Honest feedback from shoppers who purchased this product.
                    </p>
                </div>
                {!loading && reviewCount > 0 && (
                    <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
                        <span className="text-3xl font-bold text-neutral-900">{averageRating.toFixed(1)}</span>
                        <div>
                            <StarsDisplay rating={Math.min(5, Math.max(1, Math.round(averageRating)))} />
                            <p className="mt-0.5 text-xs text-neutral-500">
                                Based on {reviewCount} review{reviewCount === 1 ? "" : "s"}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {isLoaded && isSignedIn && (
                <form
                    onSubmit={handleSubmit}
                    className="mb-10 rounded-2xl border border-neutral-200 bg-indigo-50/40 p-5 sm:p-6"
                >
                    <h3 className="text-lg font-semibold text-neutral-900 raleway">
                        {myReview ? "Update your review" : "Write a review"}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-600">
                        Share photos and a star rating — it helps others decide.
                    </p>
                    <div className="mt-4 space-y-4">
                        <div>
                            <Label className="text-neutral-700">Rating</Label>
                            <div className="mt-2">
                                <StarPicker value={rating} onChange={setRating} />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="review-text">Your review</Label>
                            <Textarea
                                id="review-text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="What did you like? How was the quality?"
                                className="mt-2 min-h-[100px] border-neutral-300 bg-white"
                                maxLength={2000}
                            />
                            <p className="mt-1 text-xs text-neutral-500">{text.length}/2000</p>
                        </div>
                        <div>
                            <Label>Photos (optional, up to 4)</Label>
                            <div className="mt-2 max-w-md">
                                <UploadDropzone
                                    endpoint="reviewImages"
                                    onClientUploadComplete={(res) => {
                                        const urls = res
                                            .map((f: { ufsUrl?: string; url?: string }) => f.ufsUrl ?? f.url)
                                            .filter(Boolean) as string[];
                                        setImages((prev) => [...prev, ...urls].slice(0, 4));
                                    }}
                                    onUploadError={(e) => {
                                        toast.error(e.message);
                                    }}
                                />
                            </div>
                            {images.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {images.map((url, i) => (
                                        <div key={url + i} className="relative h-16 w-16 overflow-hidden rounded-lg border">
                                            <Image src={url} alt="" fill className="object-cover" sizes="64px" />
                                            <button
                                                type="button"
                                                className="absolute right-0 top-0 rounded-bl bg-black/60 px-1 text-xs text-white"
                                                onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="bg-rose-600 hover:bg-rose-700"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving…
                                </>
                            ) : myReview ? (
                                "Update review"
                            ) : (
                                "Post review"
                            )}
                        </Button>
                    </div>
                </form>
            )}

            {isLoaded && !isSignedIn && (
                <div className="mb-10 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
                    <p className="text-neutral-700 raleway">
                        <Link href="/sign-in" className="font-semibold text-rose-600 underline">
                            Sign in
                        </Link>{" "}
                        to leave a review with photos and a star rating.
                    </p>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-neutral-500">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Loading reviews…
                </div>
            ) : reviews.length === 0 ? (
                <p className="py-8 text-center text-neutral-600 raleway">
                    No reviews yet. Be the first to share your experience.
                </p>
            ) : (
                <ul className="space-y-6">
                    {reviews.map((r) => (
                        <li
                            key={r._id}
                            className={cn(
                                "rounded-xl border border-neutral-200 bg-white p-5 shadow-sm",
                                user?.id === r.authorUserId && "ring-2 ring-rose-100"
                            )}
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-neutral-900">{r.authorName}</p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <StarsDisplay rating={r.rating} />
                                        <span className="text-xs text-neutral-500">
                                            {r.createdAt
                                                ? format(new Date(r.createdAt), "d MMM yyyy")
                                                : ""}
                                        </span>
                                    </div>
                                </div>
                                {user?.id === r.authorUserId && (
                                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
                                        Your review
                                    </span>
                                )}
                            </div>
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700 raleway">
                                {r.text}
                            </p>
                            {r.images && r.images.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {r.images.map((img, idx) => (
                                        <div
                                            key={img + idx}
                                            className="relative h-24 w-24 overflow-hidden rounded-lg border sm:h-28 sm:w-28"
                                        >
                                            <Image
                                                src={img}
                                                alt={`Review photo ${idx + 1}`}
                                                fill
                                                className="object-cover"
                                                sizes="112px"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
