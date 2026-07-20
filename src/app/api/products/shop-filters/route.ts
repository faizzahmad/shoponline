import Product from "@/lib/models/product-model";
import { connectToDb } from "@/lib/connectToDb";
import {
  buildShopProductFilter,
  parseShopFilterParams,
} from "@/lib/shop-product-filter";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const {
    categoryList,
    subList,
    searchTrimmed,
    minPrice,
    maxPrice,
    inStock,
    onSale,
    variantFilters,
  } = parseShopFilterParams(url.searchParams);

  await connectToDb();

  try {
    /** Facets for price/attributes ignore price/stock/sale/variant selection. */
    const baseFilter = buildShopProductFilter({
      categoryIds: categoryList,
      subCategoryIds: subList,
      search: searchTrimmed,
    });

    const [stats] = await Product.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$originalPrice" },
          maxPrice: { $max: "$originalPrice" },
          totalProducts: { $sum: 1 },
          inStockCount: {
            $sum: { $cond: [{ $gt: ["$productStock", 0] }, 1, 0] },
          },
          onSaleCount: {
            $sum: {
              $cond: [{ $gt: ["$discountPrice", "$originalPrice"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const attributeRows = await Product.aggregate([
      { $match: baseFilter },
      { $match: { "variantCombinations.0": { $exists: true } } },
      { $unwind: "$variantCombinations" },
      { $unwind: "$variantCombinations.attributes" },
      {
        $group: {
          _id: {
            name: "$variantCombinations.attributes.name",
            value: "$variantCombinations.attributes.value",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.name",
          options: {
            $push: {
              value: "$_id.value",
              count: "$count",
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    /** Fallback: products with variantAttributes but no combinations yet */
    const attributeDefRows = await Product.aggregate([
      { $match: baseFilter },
      { $match: { "variantAttributes.0": { $exists: true } } },
      { $unwind: "$variantAttributes" },
      { $unwind: "$variantAttributes.options" },
      {
        $group: {
          _id: {
            name: "$variantAttributes.name",
            value: "$variantAttributes.options",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.name",
          options: {
            $push: {
              value: "$_id.value",
              count: "$count",
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const mergedAttributes = new Map<
      string,
      Map<string, number>
    >();

    for (const row of [...attributeRows, ...attributeDefRows]) {
      if (!row._id || typeof row._id !== "string") continue;
      const name = row._id as string;
      if (!mergedAttributes.has(name)) mergedAttributes.set(name, new Map());
      const optionMap = mergedAttributes.get(name)!;
      for (const opt of row.options as Array<{ value: string; count: number }>) {
        if (!opt.value) continue;
        optionMap.set(opt.value, (optionMap.get(opt.value) ?? 0) + opt.count);
      }
    }

    const attributes = [...mergedAttributes.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, optionMap]) => ({
        name,
        options: [...optionMap.entries()]
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => a.value.localeCompare(b.value)),
      }));

    const filteredCount = await Product.countDocuments(
      buildShopProductFilter({
        categoryIds: categoryList,
        subCategoryIds: subList,
        search: searchTrimmed,
        minPrice,
        maxPrice,
        inStock,
        onSale,
        variantFilters,
      })
    );

    const min = stats?.minPrice != null ? Math.floor(Number(stats.minPrice)) : 0;
    const max = stats?.maxPrice != null ? Math.ceil(Number(stats.maxPrice)) : 0;

    return new Response(
      JSON.stringify({
        priceRange: {
          min: Number.isFinite(min) ? min : 0,
          max: Number.isFinite(max) ? max : 0,
        },
        attributes,
        totalProducts: stats?.totalProducts ?? 0,
        filteredProducts: filteredCount,
        inStockCount: stats?.inStockCount ?? 0,
        onSaleCount: stats?.onSaleCount ?? 0,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching shop filters:", error);
    return new Response(JSON.stringify({ error: "Error fetching shop filters" }), {
      status: 500,
    });
  }
}
