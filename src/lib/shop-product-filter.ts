/** Shared shop listing search + MongoDB filter builder. */

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const MAX_SEARCH_TOKENS = 12;

function hasLetterOrNumber(s: string): boolean {
  return /[\p{L}\p{N}]/u.test(s.normalize("NFKC"));
}

function normalizeSearchInput(raw: string): string {
  return raw
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[^\p{L}\p{N}\s._-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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

function tokenToFlexiblePattern(token: string): string {
  const parts = token.split(/[-_.]+/).filter((p) => p.length > 0);
  if (parts.length === 0) return escapeRegex(token);
  if (parts.length === 1) return escapeRegex(parts[0]);
  return parts.map(escapeRegex).join("[-\\s._]*");
}

const MIN_LOOSE_TOKEN = 4;
const MAX_LOOSE_TOKEN = 14;

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

export function buildSmartSearchQuery(searchTrimmed: string): Record<string, unknown> {
  const tokens = deriveSearchTokens(searchTrimmed);
  if (tokens.length === 0) {
    return hasLetterOrNumber(searchTrimmed) ? { _id: { $in: [] } } : {};
  }
  const clauses = tokens.map((t) => matchTokenClause(t));
  if (clauses.length === 1) return clauses[0];
  return { $and: clauses };
}

export type ShopProductFilterInput = {
  categoryIds?: string[];
  subCategoryIds?: string[];
  search?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  inStock?: boolean;
  onSale?: boolean;
  /** e.g. { color: ["Black"], size: ["M", "L"] } */
  variantFilters?: Record<string, string[]>;
};

export function parseVariantFilterParam(
  entries: string[]
): Record<string, string[]> {
  const map = new Map<string, Set<string>>();
  for (const entry of entries) {
    const sep = entry.indexOf(":");
    if (sep <= 0) continue;
    const name = entry.slice(0, sep).trim();
    const value = entry.slice(sep + 1).trim();
    if (!name || !value) continue;
    if (!map.has(name)) map.set(name, new Set());
    map.get(name)!.add(value);
  }
  return Object.fromEntries(
    [...map.entries()].map(([name, values]) => [name, [...values]])
  );
}

export function serializeVariantFilters(
  filters: Record<string, string[]>
): string[] {
  const out: string[] = [];
  for (const [name, values] of Object.entries(filters)) {
    for (const value of values) {
      if (name && value) out.push(`${name}:${value}`);
    }
  }
  return out;
}

function buildVariantFilterClauses(
  variantFilters: Record<string, string[]>
): Record<string, unknown>[] {
  return Object.entries(variantFilters)
    .filter(([, values]) => values.length > 0)
    .map(([name, values]) => ({
      variantCombinations: {
        $elemMatch: {
          attributes: {
            $elemMatch: {
              name,
              value: { $in: values },
            },
          },
        },
      },
    }));
}

export function buildShopProductFilter(input: ShopProductFilterInput): Record<string, unknown> {
  const categoryList = input.categoryIds?.filter(Boolean) ?? [];
  const subList = input.subCategoryIds?.filter(Boolean) ?? [];
  const searchTrimmed = (input.search ?? "").trim();
  const searchQuery = searchTrimmed ? buildSmartSearchQuery(searchTrimmed) : {};

  const clauses: Record<string, unknown>[] = [];

  if (categoryList.length) {
    clauses.push({ productCategoryId: { $in: categoryList } });
  }
  if (subList.length) {
    clauses.push({ productSubCategoryId: { $in: subList } });
  }
  if (Object.keys(searchQuery).length > 0) {
    clauses.push(searchQuery);
  }

  const minPrice =
    input.minPrice != null && Number.isFinite(input.minPrice) ? input.minPrice : null;
  const maxPrice =
    input.maxPrice != null && Number.isFinite(input.maxPrice) ? input.maxPrice : null;

  if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
    clauses.push({ _id: { $in: [] } });
  } else {
    if (minPrice != null) {
      clauses.push({ originalPrice: { $gte: minPrice } });
    }
    if (maxPrice != null) {
      clauses.push({ originalPrice: { $lte: maxPrice } });
    }
  }

  if (input.inStock) {
    clauses.push({ productStock: { $gt: 0 } });
  }

  if (input.onSale) {
    clauses.push({ $expr: { $gt: ["$discountPrice", "$originalPrice"] } });
  }

  clauses.push(...buildVariantFilterClauses(input.variantFilters ?? {}));

  if (clauses.length === 0) return {};
  if (clauses.length === 1) return clauses[0];
  return { $and: clauses };
}

export function parseShopFilterParams(searchParams: URLSearchParams) {
  const categoryList =
    searchParams.get("category")?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  const subList =
    searchParams.get("subcategory")?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  const searchTrimmed = (searchParams.get("search") ?? "").trim();

  const minRaw = searchParams.get("minPrice");
  const maxRaw = searchParams.get("maxPrice");
  const minPrice = minRaw != null && minRaw !== "" ? Number(minRaw) : null;
  const maxPrice = maxRaw != null && maxRaw !== "" ? Number(maxRaw) : null;

  const variantFilterEntries =
    searchParams.getAll("vf").length > 0
      ? searchParams.getAll("vf")
      : (searchParams.get("vf")?.split(",").map((s) => s.trim()).filter(Boolean) ?? []);

  return {
    categoryList,
    subList,
    searchTrimmed,
    hasSearch: searchTrimmed.length > 0,
    minPrice: Number.isFinite(minPrice) ? minPrice : null,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : null,
    inStock: searchParams.get("inStock") === "true",
    onSale: searchParams.get("onSale") === "true",
    variantFilters: parseVariantFilterParam(variantFilterEntries),
    sortBy: searchParams.get("sortBy") || "recommended",
    page: parseInt(searchParams.get("page") || "1", 10),
    limit: parseInt(searchParams.get("limit") || "10", 10),
  };
}
