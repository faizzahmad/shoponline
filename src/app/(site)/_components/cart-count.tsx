"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsChanged } from "@/store/use-ischnaged";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface CartCountProps {
  phoneNumber?: string;
}

export const CartCount = ({ phoneNumber }: CartCountProps) => {
  const [cartCount, setCartCount] = useState<number>(0);
  const [loader, setLoader] = useState<boolean>(false);
  const { isChanged } = useIsChanged((state) => state);

  useEffect(() => {
    if (!phoneNumber) return;

    const fetchCartCount = async () => {
      setLoader(true);
      try {
        const res = await fetch(
          `/api/cart/count?phone=${encodeURIComponent(phoneNumber)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setCartCount(data.count);
        } else {
          console.log("Failed to fetch cart count");
        }
      } catch (error) {
        console.error("Error fetching cart count:", error);
      }
      setLoader(false);
    };

    fetchCartCount();
  }, [phoneNumber, isChanged]);

  return (
    <Link
      href={"/cart"}
      className="flex flex-col gap-1 cursor-pointer items-center justify-center hover:text-red-600 transition"
    >
      <div className="relative">
        <ShoppingCart className="size-5" />
        {loader && (
          <Skeleton className="absolute -top-3 -right-[3px] bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-semibold" />
        )}
        {!loader && cartCount > 0 && (
          <div className="absolute -top-3 -right-[3px] bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-semibold">
            {cartCount}
          </div>
        )}
      </div>
      <span className="text-xs font-semibold">Cart</span>
    </Link>
  );
};
