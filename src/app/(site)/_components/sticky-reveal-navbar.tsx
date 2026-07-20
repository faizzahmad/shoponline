"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const SCROLL_ROOT_ID = "site-scroll-root";

type StickyRevealNavbarProps = {
    children: React.ReactNode;
};

export function StickyRevealNavbar({ children }: StickyRevealNavbarProps) {
    const [visible, setVisible] = useState(true);
    const [barHeight, setBarHeight] = useState(0);
    const innerRef = useRef<HTMLDivElement>(null);
    const lastScrollTop = useRef(0);
    const ticking = useRef(false);

    useLayoutEffect(() => {
        const el = innerRef.current;
        if (!el) return;

        const measure = () => {
            const inner = el.firstElementChild as HTMLElement | null;
            const next = (inner ?? el).offsetHeight;
            setBarHeight((prev) => (prev === next ? prev : next));
        };
        measure();

        // Recheck after images/fonts settle so spacer matches real navbar height
        const t1 = window.setTimeout(measure, 50);
        const t2 = window.setTimeout(measure, 300);

        const ro = new ResizeObserver(measure);
        ro.observe(el);
        if (el.firstElementChild) ro.observe(el.firstElementChild);
        return () => {
            ro.disconnect();
            window.clearTimeout(t1);
            window.clearTimeout(t2);
        };
    }, [children]);

    const onScroll = useCallback(() => {
        const root = document.getElementById(SCROLL_ROOT_ID);
        if (!root) return;

        if (ticking.current) return;
        ticking.current = true;

        requestAnimationFrame(() => {
            ticking.current = false;
            const y = root.scrollTop;
            const delta = y - lastScrollTop.current;
            lastScrollTop.current = y;

            if (y < 24) {
                setVisible(true);
                return;
            }
            if (delta > 8) {
                setVisible(false);
                return;
            }
            if (delta < -8) {
                setVisible(true);
            }
        });
    }, []);

    useEffect(() => {
        const root = document.getElementById(SCROLL_ROOT_ID);
        if (!root) return;
        lastScrollTop.current = root.scrollTop;
        root.addEventListener("scroll", onScroll, { passive: true });
        return () => root.removeEventListener("scroll", onScroll);
    }, [onScroll]);

    return (
        <>
            <div
                aria-hidden
                className="w-full shrink-0"
                style={{
                    height: barHeight > 0 ? barHeight : "5.5rem",
                }}
            />
            <div
                ref={innerRef}
                className={cn(
                    "fixed left-0 right-0 top-0 z-[100] bg-white/95 shadow-[0_1px_0_rgba(33, 33, 33,0.1)] transition-transform duration-300 ease-out will-change-transform",
                    visible
                        ? "translate-y-0"
                        : "-translate-y-full pointer-events-none"
                )}
            >
                {children}
            </div>
        </>
    );
}
