"use client";

import { cn } from "@/lib/utils";
import { Copy, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    FaFacebook,
    FaInstagram,
    FaTelegram,
    FaWhatsapp,
    FaXTwitter,
} from "react-icons/fa6";
import { toast } from "sonner";

type ShareProductMenuProps = {
    productId: string;
    productName: string;
    productImage?: string;
    price?: number | string;
    shortDescription?: string;
    triggerClassName?: string;
    triggerVariant?: "brand" | "outline";
};

function getProductUrl(productId: string): string {
    const base =
        typeof window !== "undefined"
            ? window.location.origin
            : (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
              "https://www.najakclothing.com");
    return `${base}/product-info/${productId}`;
}

function buildShareMessage(
    productName: string,
    price: number | string | undefined,
    shortDescription: string | undefined,
    productUrl: string
): string {
    const lines = [productName];
    if (price !== undefined && price !== "") {
        lines.push(`Price: ₹${price}`);
    }
    if (shortDescription?.trim()) {
        lines.push(shortDescription.trim());
    }
    lines.push(`View product: ${productUrl}`);
    return lines.join("\n");
}

type ShareChannel = {
    id: string;
    label: string;
    href?: string;
    onClick?: () => void;
    icon: React.ReactNode;
    className: string;
    external?: boolean;
};

export function ShareProductMenu({
    productId,
    productName,
    productImage,
    price,
    shortDescription,
    triggerClassName,
    triggerVariant = "brand",
}: ShareProductMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const productUrl = useMemo(() => getProductUrl(productId), [productId]);

    const shareMessage = useMemo(
        () => buildShareMessage(productName, price, shortDescription, productUrl),
        [productName, price, shortDescription, productUrl]
    );

    const copyLink = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(productUrl);
            toast.success("Link copied to clipboard");
        } catch {
            toast.error("Could not copy link. Please try again.");
        }
    }, [productUrl]);

    const copyForInstagram = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(shareMessage);
            toast.success("Copied — paste in Instagram DM or story");
        } catch {
            toast.error("Could not copy. Please try again.");
        }
    }, [shareMessage]);

    const channels: ShareChannel[] = useMemo(
        () => [
            {
                id: "whatsapp",
                label: "WhatsApp",
                href: `https://wa.me/?text=${encodeURIComponent(shareMessage)}`,
                external: true,
                icon: <FaWhatsapp className="size-4 sm:size-5" aria-hidden />,
                className: "bg-[#25D366] text-white hover:bg-[#1ebe57]",
            },
            {
                id: "facebook",
                label: "Facebook",
                href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
                external: true,
                icon: <FaFacebook className="size-4 sm:size-5" aria-hidden />,
                className: "bg-[#1877F2] text-white hover:bg-[#166fe0]",
            },
            {
                id: "instagram",
                label: "Instagram",
                onClick: copyForInstagram,
                icon: <FaInstagram className="size-4 sm:size-5" aria-hidden />,
                className:
                    "bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white hover:opacity-90",
            },
            {
                id: "telegram",
                label: "Telegram",
                href: `https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(shareMessage)}`,
                external: true,
                icon: <FaTelegram className="size-4 sm:size-5" aria-hidden />,
                className: "bg-[#229ED9] text-white hover:bg-[#1d8fc4]",
            },
            {
                id: "x",
                label: "X",
                href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`,
                external: true,
                icon: <FaXTwitter className="size-4 sm:size-5" aria-hidden />,
                className: "bg-neutral-900 text-white hover:bg-neutral-800",
            },
            {
                id: "copy",
                label: "Copy link",
                onClick: copyLink,
                icon: <Copy className="size-3.5 sm:size-4" aria-hidden />,
                className:
                    "bg-[#eef4fb] text-[#244d7c] border border-[#244d7c]/15 hover:bg-[#e2ecf7]",
            },
        ],
        [shareMessage, productUrl, copyLink, copyForInstagram]
    );

    const triggerStyles =
        triggerVariant === "brand"
            ? "bg-[#244d7c] text-white border border-[#244d7c] shadow-sm hover:bg-[#426b9a]"
            : "bg-white text-[#244d7c] border border-[#244d7c]/20 shadow-sm hover:bg-[#f4f8fc]";

    useEffect(() => {
        if (!isOpen) return;

        function handlePointerDown(event: PointerEvent) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    return (
        <div ref={menuRef} className="relative z-[130]">
            <button
                type="button"
                className={cn(
                    "exo flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244d7c]/40 sm:gap-2 sm:px-4 sm:text-sm",
                    triggerStyles,
                    triggerClassName
                )}
                onClick={() => setIsOpen((open) => !open)}
                aria-expanded={isOpen}
            >
                Share
                <Share2 className="size-3.5 sm:size-4" aria-hidden />
            </button>

            {isOpen ? (
                <div className="absolute right-0 top-full z-[140] mt-2 w-[min(calc(100vw-1.25rem),17rem)] overflow-hidden rounded-xl border border-[#244d7c]/10 bg-white p-0 text-popover-foreground shadow-xl sm:w-[20rem]">
                <div className="flex gap-2 border-b border-[#244d7c]/10 bg-[#f4f8fc] p-2.5 sm:gap-3 sm:p-3.5">
                    {productImage ? (
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-[#244d7c]/10 bg-white sm:size-[4.5rem]">
                            <Image
                                src={productImage}
                                alt={productName}
                                fill
                                className="object-cover object-center"
                                sizes="(max-width: 640px) 56px, 72px"
                            />
                        </div>
                    ) : (
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-dashed border-[#244d7c]/20 bg-white text-[9px] text-[#426b9a] sm:size-[4.5rem] sm:text-[10px]">
                            No image
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#426b9a] raleway sm:text-[10px] sm:tracking-[0.14em]">
                            Share product
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs font-semibold leading-snug text-[#244d7c] exo sm:text-sm">
                            {productName}
                        </p>
                        {price !== undefined && price !== "" ? (
                            <p className="mt-0.5 text-xs font-bold text-[#244d7c] exo sm:mt-1 sm:text-sm">
                                ₹{price}
                            </p>
                        ) : null}
                    </div>
                </div>

                <div className="p-2.5 sm:p-3.5">
                    <p className="text-xs font-semibold text-[#244d7c] exo sm:text-sm">
                        Share with friends
                    </p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-neutral-500 raleway sm:mt-1 sm:text-xs">
                        Choose an app to send this product link, or copy the link to share anywhere.
                    </p>

                    <div className="mt-2.5 grid grid-cols-3 gap-1.5 sm:mt-3.5 sm:gap-2.5">
                        {channels.map((channel) => {
                            const inner = (
                                <>
                                    <span
                                        className={cn(
                                            "flex size-9 items-center justify-center rounded-lg transition sm:size-11 sm:rounded-xl",
                                            channel.className
                                        )}
                                    >
                                        {channel.icon}
                                    </span>
                                    <span className="mt-1 block text-center text-[9px] font-medium leading-tight text-[#426b9a] raleway sm:mt-1.5 sm:text-[10px]">
                                        {channel.label}
                                    </span>
                                </>
                            );

                            if (channel.href) {
                                return (
                                    <Link
                                        key={channel.id}
                                        href={channel.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center rounded-lg p-0.5 transition hover:bg-[#f4f8fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244d7c]/30 sm:p-1"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {inner}
                                    </Link>
                                );
                            }

                            return (
                                <button
                                    key={channel.id}
                                    type="button"
                                    className="flex flex-col items-center rounded-lg p-0.5 transition hover:bg-[#f4f8fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244d7c]/30 sm:p-1"
                                    onClick={() => {
                                        channel.onClick?.();
                                        setIsOpen(false);
                                    }}
                                >
                                    {inner}
                                </button>
                            );
                        })}
                    </div>
                </div>
                </div>
            ) : null}
        </div>
    );
}
