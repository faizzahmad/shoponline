"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useIsChanged } from "@/store/use-ischnaged";
import { useGuestCart } from "@/store/use-guest-cart";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type CartCountProps = {
  userEmail?: string | null;
};

export const CartCount = ({ userEmail }: CartCountProps) => {
  const [cartCount, setCartCount] = useState(0);
  const [loader, setLoader] = useState(false);
  const { isChanged } = useIsChanged((state) => state);
  const guestLineCount = useGuestCart((s) => s.items.length);

  useEffect(() => {
    const email = (userEmail ?? "").trim();
    if (!email) return;

    const fetchCartCount = async () => {
      setLoader(true);
      try {
        const res = await fetch(
          `/api/cart/count?email=${encodeURIComponent(email)}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setCartCount(Number(data.count ?? 0));
        } else {
          console.log("Failed to fetch cart count");
        }
      } catch (error) {
        console.error("Error fetching cart count:", error);
      }
      setLoader(false);
    };

    void fetchCartCount();
  }, [userEmail, isChanged]);

  const displayCount = userEmail ? cartCount : guestLineCount;

  return (
    <Link
      href={"/cart"}
      className="flex flex-col gap-1 cursor-pointer items-center justify-center hover:text-[#1B3F66] transition text-[#0F2744]"
    >
      <div className="relative">
        <ShoppingCart className="size-5" />
        {userEmail && loader && (
          <Skeleton className="absolute -top-3 -right-[3px] h-4 w-4 rounded-full bg-[#0F2744]/30" />
        )}
        {(!userEmail || !loader) && displayCount > 0 && (
          <div className="absolute -top-3 -right-[3px] flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0F2744] px-1 text-[10px] font-semibold text-white">
            {displayCount > 99 ? "99+" : displayCount}
          </div>
        )}
      </div>
      <span className="text-xs font-semibold">Cart</span>
    </Link>
  );
};
