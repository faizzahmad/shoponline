import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["top", "bottom"],
    },
    link: {
      type: String,
      default: "/shop",
    },
    image: {
      type: String,
      required: true,
    },
    /** Optional portrait/mobile crop; falls back to `image` on storefront */
    mobileImage: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    subtitle: {
      type: String,
      default: "",
    },
    ctaLabel: {
      type: String,
      default: "Shop now",
    },
  },
  { timestamps: true }
);

// Avoid stale schema during Next.js hot reload
if (mongoose.models.Banner) {
  delete mongoose.models.Banner;
}

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;
