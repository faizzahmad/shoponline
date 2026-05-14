import Product from "@/lib/models/product-model";
import { connectToDb } from "@/lib/connectToDb";
import type { PipelineStage } from "mongoose";

/** Safe literal for MongoDB $regex (avoid ReDoS / syntax errors from user input). */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const MAX_SEARCH_TOKENS = 12;

/** True if the string has any letter or number (any script). */
function hasLetterOrNumber(s: string): boolean {
  return /[\p{L}\p{N}]/u.test(s.normalize("NFKC"));
}

/**
 * Drop decorative / special characters for search; keep letters, numbers,
 * whitespace, and common in-word separators (hyphen, dot, underscore).
 */
function normalizeSearchInput(raw: string): string {
  return raw
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[^\p{L}\p{N}\s._-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Words split on spaces; each word must be length >= 2 (single letters are dropped as noise).
 * If nothing survives, fall back to one collapsed alphanumeric token (e.g. "XL").
 */
function deriveSearchTokens(raw: string): string[] {
  const normalized = normalizeSearchInput(raw);
  if (!normalized) return [];

  const words = normalized.split(" ").filter(Boolean);
  const tokens = words
    .map((w) => w.replace(/^[.\s_-]+|[.\s_-]+$/g, ""))
    .filter((w) => w.length >= 2)
    .slice(0, MAX_SEARCH_TOKENS);

  if (tokens.length > 0) return tokens;

  const collapsed = words.join("").replace(/[^\p{L}\p{N}]+/gu, "");
  if (collapsed.length >= 2) return [collapsed];
  if (collapsed.length === 1) return [collapsed];
  return [];
}

/**
 * "t-shirt" -> t[-\\s._]*shirt so "T Shirt" / "T-Shirt" / "t.shirt" all match.
 */
function tokenToFlexiblePattern(token: string): string {
  const parts = token.split(/[-_.]+/).filter((p) => p.length > 0);
  if (parts.length === 0) return escapeRegex(token);
  if (parts.length === 1) return escapeRegex(parts[0]);
  return parts.map(escapeRegex).join("[-\\s._]*");
}

const MIN_LOOSE_TOKEN = 4;
const MAX_LOOSE_TOKEN = 14;

/**
 * "tshirt" / "TSHIRTS" -> letters may be separated by punctuation, hyphen, space
 * (e.g. matches "T-Shirt", "T Shirts") without requiring the user to type separators.
 */
function tokenToLooseSubsequencePatterns(token: string): string[] {
  const variants = new Set<string>();
  variants.add(token);
  if (token.length > MIN_LOOSE_TOKEN && /s$/i.test(token)) {
    variants.add(token.slice(0, -1));
  }
  if (token.length >= MIN_LOOSE_TOKEN && !/s$/i.test(token)) {
    variants.add(`${token}s`);
  }

  const patterns: string[] = [];
  for (const v of variants) {
    const chars = [...v.normalize("NFKC")].filter((c) => /\p{L}|\p{N}/u.test(c));
    if (chars.length < MIN_LOOSE_TOKEN || chars.length > MAX_LOOSE_TOKEN) continue;
    patterns.push(chars.map(escapeRegex).join("[^\\p{L}\\p{N}]*"));
  }
  return [...new Set(patterns)];
}

/**
 * One token must match at least one path. Multi-token queries use $and.
 */
function matchTokenClause(token: string) {
  const pattern = tokenToFlexiblePattern(token);
  const loosePatterns = tokenToLooseSubsequencePatterns(token);

  const looseFields = [
    "productName",
    "shortDescription",
    "longDescription",
    "productCategory",
    "productSubCategory",
    "variantCombinations.attributes.name",
    "variantCombinations.attributes.value",
    "varients.products.pname",
    "variantAttributes.name",
    "variantAttributes.options",
  ] as const;

  const looseClauses = loosePatterns.flatMap((lp) =>
    looseFields.map((field) => ({
      [field]: { $regex: lp, $options: "i" },
    }))
  );

  return {
    $or: [
      { productName: { $regex: pattern, $options: "i" } },
      { productId: { $regex: pattern, $options: "i" } },
      { shortDescription: { $regex: pattern, $options: "i" } },
      { longDescription: { $regex: pattern, $options: "i" } },
      { productCategory: { $regex: pattern, $options: "i" } },
      { productSubCategory: { $regex: pattern, $options: "i" } },
      { productCategoryId: { $regex: pattern, $options: "i" } },
      { productSubCategoryId: { $regex: pattern, $options: "i" } },
      { "variantCombinations.sku": { $regex: pattern, $options: "i" } },
      { "variantCombinations.attributes.name": { $regex: pattern, $options: "i" } },
      { "variantCombinations.attributes.value": { $regex: pattern, $options: "i" } },
      { "varients.type": { $regex: pattern, $options: "i" } },
      { "varients.products.value": { $regex: pattern, $options: "i" } },
      { "varients.products.pname": { $regex: pattern, $options: "i" } },
      { "variantAttributes.name": { $regex: pattern, $options: "i" } },
      { "variantAttributes.options": { $regex: pattern, $options: "i" } },
      ...looseClauses,
    ],
  };
}

function buildSmartSearchQuery(searchTrimmed: string): Record<string, unknown> {
  const tokens = deriveSearchTokens(searchTrimmed);
  if (tokens.length === 0) {
    return hasLetterOrNumber(searchTrimmed) ? { _id: { $in: [] } } : {};
  }
  const clauses = tokens.map((t) => matchTokenClause(t));
  if (clauses.length === 1) return clauses[0];
  return { $and: clauses };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const categories = url.searchParams.get("category");
  const subCategories = url.searchParams.get("subcategory");
  const search = url.searchParams.get("search");
  const sortBy = url.searchParams.get("sortBy") || "new";
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const skip = (page - 1) * limit;

  await connectToDb();

  try {
    const categoryList =
      categories?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
    const subList =
      subCategories?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
    const searchTrimmed = (search ?? "").trim();
    const hasSearch = searchTrimmed.length > 0;

    const searchQuery = hasSearch ? buildSmartSearchQuery(searchTrimmed) : {};

    const filter = {
      $and: [
        categoryList.length
          ? { productCategoryId: { $in: categoryList } }
          : {},
        subList.length ? { productSubCategoryId: { $in: subList } } : {},
        searchQuery,
      ],
    };

    /** Default shop view: mixed order (not strictly newest-first), stable per UTC day for pagination. */
    const useMixedRecommended =
      sortBy === "recommended" &&
      categoryList.length === 0 &&
      subList.length === 0 &&
      !hasSearch;

    let products: unknown[];

    if (useMixedRecommended) {
      const now = new Date();
      const daySeed =
        now.getUTCFullYear() * 10000 +
        (now.getUTCMonth() + 1) * 100 +
        now.getUTCDate();

      const pipeline: PipelineStage[] = [
        { $match: filter },
        {
          $addFields: {
            _mixKey: {
              $mod: [
                {
                  $add: [
                    { $multiply: [{ $toLong: "$createdAt" }, 7919] },
                    {
                      $multiply: [
                        { $toDouble: { $ifNull: ["$originalPrice", 0] } },
                        131,
                      ],
                    },
                    {
                      $multiply: [
                        { $strLenCP: { $ifNull: ["$productName", ""] } },
                        17,
                      ],
                    },
                    { $toDouble: { $ifNull: ["$totalSales", 0] } },
                    { $multiply: [daySeed, 9241] },
                  ],
                },
                999999937,
              ],
            },
          },
        },
        { $sort: { _mixKey: 1, _id: 1 } },
        { $skip: skip },
        { $limit: limit },
        { $project: { _mixKey: 0 } },
      ];

      products = await Product.aggregate(pipeline);
    } else {
      let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };

      switch (sortBy) {
        case "top-selling":
          sortQuery = { totalSales: -1 };
          break;
        case "lowToHigh":
          sortQuery = { originalPrice: 1 };
          break;
        case "highToLow":
          sortQuery = { originalPrice: -1 };
          break;
        case "new":
          sortQuery = { createdAt: -1 };
          break;
        case "recommended":
        default:
          sortQuery = { createdAt: -1 };
          break;
      }

      products = await Product.find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit);
    }

    const totalProducts = await Product.countDocuments(filter);

    return new Response(
      JSON.stringify({
        products,
        totalProducts,
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return new Response(JSON.stringify({ error: "Error fetching products" }), {
      status: 500,
    });
  }
}
