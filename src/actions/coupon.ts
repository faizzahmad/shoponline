"use server";

import { connectToDb } from "@/lib/connectToDb";
import Coupon from "@/lib/models/coupon-model";

export type ActiveCoupon = {
  id: string;
  couponCode: string;
  discountPercentage: number;
  validTo: string;
  remainingCount: number;
};

export const getActiveCoupons = async (limit = 3): Promise<ActiveCoupon[]> => {
  await connectToDb();
  const now = new Date();

  try {
    const coupons = await Coupon.find({
      validFrom: { $lte: now },
      validTo: { $gte: now },
      $expr: { $lt: ["$usedCount", "$maxCount"] },
    })
      .sort({ discountPercentage: -1, createdAt: -1 })
      .limit(limit)
      .select("_id couponCode discountPercentage validTo maxCount usedCount")
      .lean();

    return coupons.map((coupon) => ({
      id: String(coupon._id),
      couponCode: String(coupon.couponCode),
      discountPercentage: Number(coupon.discountPercentage),
      validTo: new Date(coupon.validTo).toISOString(),
      remainingCount: Math.max(0, Number(coupon.maxCount) - Number(coupon.usedCount ?? 0)),
    }));
  } catch (error) {
    console.error("Error fetching active coupons:", error);
    return [];
  }
};

