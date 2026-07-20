import { Layers, PackageCheck, RotateCcw } from "lucide-react";
import Link from "next/link";

const highlights = [
    {
        step: "01",
        icon: Layers,
        title: "Many categories",
        description:
            "Clothes, footwear, furniture, electronics, and more — all in one store.",
        href: "/shop",
        cta: "Browse all",
        variant: "dark" as const,
    },
    {
        step: "02",
        icon: PackageCheck,
        title: "Fast shipping",
        description:
            "Quick order dispatch so your favorites arrive right on time.",
        href: "/policies",
        cta: "Delivery info",
        variant: "accent" as const,
    },
    {
        step: "03",
        icon: RotateCcw,
        title: "Easy returns",
        description:
            "Shop with confidence thanks to clear return policies and support.",
        href: "/policies",
        cta: "Return policy",
        variant: "light" as const,
    },
];

const cardStyles = {
    dark: {
        shell:
            "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-[0_18px_40px_-12px_rgba(26,26,26,0.35)]",
        step: "text-white/20",
        iconWrap: "bg-[#B8956A] text-[#1A1A1A]",
        body: "text-white/80",
        cta: "text-[#B8956A] group-hover:text-white",
        glow: "from-[#B8956A]/20 via-transparent to-transparent",
    },
    accent: {
        shell:
            "bg-[#D4BC94] text-[#1A1A1A] border-[#D4BC94] shadow-[0_18px_40px_-12px_rgba(184,149,106,0.35)]",
        step: "text-[#1A1A1A]/25",
        iconWrap: "bg-[#1A1A1A] text-[#D4BC94]",
        body: "text-[#1A1A1A]/75",
        cta: "text-[#1A1A1A] group-hover:text-[#B8956A]",
        glow: "from-white/30 via-transparent to-transparent",
    },
    light: {
        shell:
            "bg-white text-[#1A1A1A] border-[#1A1A1A]/12 shadow-[0_14px_36px_-14px_rgba(26,26,26,0.12)]",
        step: "text-[#1A1A1A]/10",
        iconWrap: "bg-[#1A1A1A]/5 text-[#1A1A1A] ring-1 ring-[#1A1A1A]/10",
        body: "text-neutral-600",
        cta: "text-[#1A1A1A] group-hover:text-[#B8956A]",
        glow: "from-[#B8956A]/15 via-transparent to-transparent",
    },
};

export const ShopHighlights = () => {
    return (
        <section className="relative overflow-hidden px-5 py-10 sm:py-14 lg:px-10">
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(251,192,45,0.12),transparent)]"
                aria-hidden
            />
            <div className="relative w-full">
                <div className="mb-8 w-full sm:mb-10">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B8956A] exo sm:text-xs">
                        Why ShopOnline
                    </p>
                    <h2 className="mt-2 text-2xl font-bold leading-tight text-[#1A1A1A] exo sm:text-3xl md:text-4xl">
                        Everything you need,{" "}
                        <span className="text-[#B8956A]">one smooth experience</span>
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-neutral-600 raleway sm:text-base">
                        From discovery to delivery — built for shoppers who want variety,
                        speed, and peace of mind.
                    </p>
                </div>

                <div className="grid w-full gap-4 md:grid-cols-3 md:gap-5">
                    {highlights.map((item, index) => {
                        const styles = cardStyles[item.variant];
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.step}
                                href={item.href}
                                className={`group relative flex min-h-[220px] flex-col overflow-hidden rounded-2xl border p-5 transition duration-300 hover:-translate-y-1 sm:min-h-[240px] sm:p-6 ${styles.shell} ${
                                    index === 1 ? "md:translate-y-3 md:hover:translate-y-2" : ""
                                } ${index === 2 ? "md:-translate-y-1 md:hover:-translate-y-2" : ""}`}
                            >
                                <div
                                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${styles.glow}`}
                                    aria-hidden
                                />
                                <span
                                    className={`pointer-events-none absolute -right-1 -top-3 select-none text-[5.5rem] font-bold leading-none exo sm:text-[6.5rem] ${styles.step}`}
                                    aria-hidden
                                >
                                    {item.step}
                                </span>

                                <div className="relative z-[1] flex flex-1 flex-col">
                                    <div
                                        className={`inline-flex size-11 items-center justify-center rounded-xl transition duration-300 group-hover:scale-105 sm:size-12 ${styles.iconWrap}`}
                                    >
                                        <Icon className="size-5 sm:size-[1.35rem]" strokeWidth={1.75} />
                                    </div>

                                    <h3 className="mt-5 text-lg font-bold leading-snug exo sm:text-xl">
                                        {item.title}
                                    </h3>
                                    <p className={`mt-2 flex-1 text-sm leading-relaxed raleway sm:text-[0.9375rem] ${styles.body}`}>
                                        {item.description}
                                    </p>

                                    <span
                                        className={`mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors exo sm:text-[13px] ${styles.cta}`}
                                    >
                                        {item.cta}
                                        <span
                                            className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                                            aria-hidden
                                        >
                                            →
                                        </span>
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
