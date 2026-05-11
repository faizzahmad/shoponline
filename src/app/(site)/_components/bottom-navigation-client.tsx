"use client";

import { cn } from "@/lib/utils";
import { CircleUserRound, House, Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type BottomNavigationClientProps = {
    isSignedIn: boolean;
};

const navItems = [
    { href: "/", label: "Home", icon: House, match: (p: string) => p === "/" },
    {
        href: "/shop",
        label: "Shop",
        icon: Store,
        match: (p: string) => p === "/shop" || p.startsWith("/shop/"),
    },
    {
        href: "/account",
        label: "Account",
        icon: CircleUserRound,
        signInHref: "/sign-in",
        match: (p: string) =>
            p.startsWith("/account") ||
            p.startsWith("/sign-in") ||
            p.startsWith("/sign-up"),
    },
] as const;

export function BottomNavigationClient({ isSignedIn }: BottomNavigationClientProps) {
    const pathname = usePathname() ?? "";

    return (
        <nav
            className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 md:hidden"
            aria-label="Primary mobile navigation"
        >
            <div
                className="pointer-events-auto mx-3 flex max-w-md items-stretch justify-between gap-1 rounded-2xl border border-[#244d7c]/14 bg-white/90 px-1 py-1 shadow-[0_2px_16px_rgba(36,77,124,0.12)] backdrop-blur-sm"
                style={{
                    marginBottom: "max(0.5rem, env(safe-area-inset-bottom))",
                }}
            >
                {navItems.map((item) => {
                    const active = item.match(pathname);
                    const href =
                        "signInHref" in item && !isSignedIn ? item.signInHref : item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={href}
                            aria-label={item.label}
                            title={item.label}
                            className={cn(
                                "relative flex min-h-[44px] min-w-[44px] flex-1 items-center justify-center rounded-xl transition-colors duration-150",
                                active
                                    ? "text-[#244d7c]"
                                    : "text-neutral-400 active:text-neutral-600"
                            )}
                        >
                            {active ? (
                                <span
                                    className="absolute inset-x-2 inset-y-1 rounded-lg bg-[#244d7c]/10"
                                    aria-hidden
                                />
                            ) : null}
                            <Icon
                                className={cn(
                                    "relative z-[1] size-[21px]",
                                    active ? "text-[#244d7c]" : "text-neutral-400"
                                )}
                                strokeWidth={active ? 2.25 : 2}
                                aria-hidden
                            />
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
