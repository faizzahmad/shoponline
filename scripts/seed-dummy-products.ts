/**
 * Seed 100 dummy products with variants + category-matched images into MongoDB.
 * Removes previous seed products (productId starting with "seed-") first.
 * Run: npm run seed:products
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import mongoose from "mongoose";
import Product from "../src/lib/models/product-model";
import Category from "../src/lib/models/category-model";
import {
  getColorVariantImage,
  getProductBaseName,
  getSubcategoryImages,
} from "./seed-product-images";

const TOTAL = 100;
const IMAGES_PER_PRODUCT = 4;

const ADJECTIVES = [
  "Premium",
  "Classic",
  "Essential",
  "Urban",
  "Daily",
  "Comfort",
  "Deluxe",
  "Smart",
  "Fresh",
  "Modern",
  "Pro",
  "Lite",
];

const COLORS = ["Black", "White", "Navy", "Beige", "Olive", "Maroon"];
const SIZES = ["S", "M", "L", "XL"];
const PACKS = ["PackOf1", "PackOf2", "PackOf3"];
const STORAGE = ["64GB", "128GB", "256GB"];

function loadEnvLocal() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const raw = readFileSync(envPath, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* use existing env */
  }
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type VariantPlan = {
  attributes: Array<{
    name: string;
    options: string[];
    displayMode: "image" | "text";
  }>;
  combos: Array<Array<{ name: string; value: string }>>;
};

function planVariants(
  subName: string,
  categoryName: string,
  index: number
): VariantPlan {
  const subLower = subName.toLowerCase();
  const catLower = categoryName.toLowerCase();

  const isPack =
    catLower.includes("grocery") ||
    subLower.includes("snack") ||
    subLower.includes("rice") ||
    subLower.includes("grain") ||
    subLower.includes("organic") ||
    subLower.includes("food");

  const isTech =
    catLower.includes("audio") ||
    catLower.includes("watch") ||
    subLower.includes("watch") ||
    subLower.includes("earbud") ||
    subLower.includes("headphone") ||
    subLower.includes("speaker") ||
    subLower.includes("microphone");

  const isAccessory =
    subLower.includes("wallet") ||
    subLower.includes("bag") ||
    subLower.includes("book") ||
    subLower.includes("notebook") ||
    subLower.includes("pen") ||
    subLower.includes("plant") ||
    subLower.includes("bbq") ||
    subLower.includes("furniture") ||
    subLower.includes("craft");

  if (isPack) {
    return {
      attributes: [{ name: "sizes", options: PACKS, displayMode: "text" }],
      combos: PACKS.map((value) => [{ name: "sizes", value }]),
    };
  }

  if (isTech) {
    const colors = COLORS.slice(0, 3);
    return {
      attributes: [
        { name: "Color", options: colors, displayMode: "image" },
        { name: "Storage", options: STORAGE, displayMode: "text" },
      ],
      combos: colors.flatMap((color) =>
        STORAGE.map((value) => [
          { name: "Color", value: color },
          { name: "Storage", value },
        ])
      ),
    };
  }

  if (isAccessory) {
    return {
      attributes: [{ name: "sizes", options: ["Standard", "Large"], displayMode: "text" }],
      combos: [
        [{ name: "sizes", value: "Standard" }],
        [{ name: "sizes", value: "Large" }],
      ],
    };
  }

  const colors = COLORS.slice(0, 4);
  return {
    attributes: [
      { name: "Color", options: colors, displayMode: "image" },
      { name: "Size", options: SIZES, displayMode: "text" },
    ],
    combos: colors.flatMap((color) =>
      SIZES.map((value) => [
        { name: "Color", value: color },
        { name: "Size", value },
      ])
    ),
  };
}

function comboKey(attrs: Array<{ name: string; value: string }>) {
  return attrs.map((a) => `${a.name}:${a.value}`).join("|");
}

function buildProductDoc(
  index: number,
  subIndex: number,
  slot: {
    categoryId: string;
    categoryName: string;
    subId: string;
    subName: string;
  }
) {
  const adj = ADJECTIVES[index % ADJECTIVES.length];
  const baseName = getProductBaseName(slot.subName, subIndex);
  const productName = `${adj} ${baseName}`;
  const productId = `seed-${slugify(slot.subName)}-${index + 1}`;
  const basePrice = 199 + (index % 40) * 50 + Math.floor(Math.random() * 80);
  const images = getSubcategoryImages(
    slot.subName,
    slot.categoryName,
    subIndex,
    IMAGES_PER_PRODUCT
  );
  const plan = planVariants(slot.subName, slot.categoryName, index);

  const colorOptions = plan.attributes.find((a) => a.name === "Color")?.options ?? [];
  const colorImages = new Map<string, string>();
  colorOptions.forEach((color) => {
    colorImages.set(
      color,
      getColorVariantImage(slot.subName, slot.categoryName, color, subIndex)
    );
  });

  const variantCombinations = plan.combos.map((attributes, comboIdx) => {
    const priceBump =
      attributes.reduce((n, a) => n + a.value.length, 0) * 3 + comboIdx * 15;
    const sell = basePrice + priceBump;
    const mrp = sell + Math.floor(sell * (0.1 + (comboIdx % 3) * 0.05));
    const colorValue = attributes.find((a) => a.name === "Color")?.value;
    return {
      variantId: `v-${slugify(comboKey(attributes))}-${index}-${comboIdx}`,
      sku: `SKU-${productId}-${comboIdx + 1}`,
      attributes,
      image: colorValue ? (colorImages.get(colorValue) ?? images[0]!) : images[0]!,
      productStock: 8 + ((index + comboIdx) % 45),
      originalPrice: sell,
      discountPrice: mrp,
      isDefault: comboIdx === 0,
    };
  });

  const totalStock = variantCombinations.reduce((s, r) => s + r.productStock, 0);
  const minPrice = Math.min(...variantCombinations.map((r) => r.originalPrice));
  const maxMrp = Math.max(...variantCombinations.map((r) => r.discountPrice));

  return {
    productName,
    productId,
    images,
    productStock: totalStock,
    productCategory: slot.categoryName,
    productCategoryId: slot.categoryId,
    productSubCategory: slot.subName,
    productSubCategoryId: slot.subId,
    discountPrice: maxMrp,
    originalPrice: minPrice,
    shortDescription: `${baseName} from our ${slot.subName} range — quality ${slot.categoryName.toLowerCase()} for everyday use.`,
    longDescription: `<p>Discover the <strong>${productName}</strong>, a top pick in <strong>${slot.subName}</strong>. Designed for ${slot.categoryName} shoppers who want style, quality, and great value.</p><ul><li>Category: ${slot.categoryName}</li><li>Subcategory: ${slot.subName}</li><li>Multiple variants available</li></ul>`,
    totalSales: Math.floor(Math.random() * 120),
    length: 10 + (index % 15),
    breadth: 8 + (index % 10),
    height: 4 + (index % 8),
    weight: 200 + (index % 20) * 50,
    varients: [],
    variantDisplayMode: plan.attributes.some((a) => a.displayMode === "image")
      ? "image"
      : "text",
    variantAttributes: plan.attributes,
    variantCombinations,
  };
}

async function main() {
  loadEnvLocal();
  const uri = process.env.NEXT_PUBLIC_MONGODB_URI;
  const dbName = process.env.NEXT_PUBLIC_DB_NAME;
  if (!uri || !dbName) {
    throw new Error("Missing NEXT_PUBLIC_MONGODB_URI or NEXT_PUBLIC_DB_NAME in .env.local");
  }

  await mongoose.connect(uri, { dbName });

  const removed = await Product.deleteMany({ productId: { $regex: /^seed-/ } });
  console.log(`🗑️  Removed ${removed.deletedCount} previous seed products.`);

  const categories = await Category.find({}).lean();
  const slots: Array<{
    categoryId: string;
    categoryName: string;
    subId: string;
    subName: string;
  }> = [];

  for (const cat of categories) {
    const catId = String(cat._id);
    const subs = (cat.subCategories as Array<{ _id?: unknown; title?: string }>) ?? [];
    for (const sub of subs) {
      if (!sub._id || !sub.title) continue;
      slots.push({
        categoryId: catId,
        categoryName: String(cat.title),
        subId: String(sub._id),
        subName: String(sub.title),
      });
    }
  }

  if (slots.length === 0) {
    throw new Error("No categories/subcategories found. Add categories in admin first.");
  }

  const subCounters = new Map<string, number>();
  const docs = Array.from({ length: TOTAL }, (_, i) => {
    const slot = slots[i % slots.length]!;
    const subIndex = subCounters.get(slot.subId) ?? 0;
    subCounters.set(slot.subId, subIndex + 1);
    return buildProductDoc(i, subIndex, slot);
  });

  const inserted = await Product.insertMany(docs, { ordered: false });
  console.log(
    `✅ Inserted ${inserted.length} products with category-matched images across ${slots.length} subcategories.`
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
