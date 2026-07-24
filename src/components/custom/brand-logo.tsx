import { BRAND_COLORS } from "@/lib/brand-colors";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  width?: number;
};

export function BrandLogo({ className, width = 140 }: BrandLogoProps) {
  const height = Math.round(width * (72 / 300));

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 300 72"
      fill="none"
      role="img"
      aria-label="ShopOnline"
      width={width}
      height={height}
      className={cn("h-auto shrink-0", className)}
    >
      <rect x="2" y="4" width="64" height="64" rx="13" fill={BRAND_COLORS.dark} />
      <path d="M16 30h36l-3.6 34H19.6L16 30z" fill="#fff" />
      <path
        d="M28 30v-7c0-5.5 4.5-10 10-10s10 4.5 10 10v7"
        fill="none"
        stroke={BRAND_COLORS.goldLight}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <rect x="26" y="42" width="18" height="3.5" rx="1.5" fill={BRAND_COLORS.goldLight} />
      <text
        x="80"
        y="50"
        fontFamily="var(--font-display), system-ui, sans-serif"
        fontSize="40"
        fontWeight="700"
        letterSpacing="-0.6"
      >
        <tspan fill={BRAND_COLORS.dark}>Shop</tspan>
        <tspan fill={BRAND_COLORS.gold}>Online</tspan>
      </text>
    </svg>
  );
}
