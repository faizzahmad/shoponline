import Product from "@/lib/models/product-model";
import { connectToDb } from "@/lib/connectToDb";
import type { PipelineStage } from "mongoose";

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

    const searchQuery = hasSearch
      ? {
          $or: [
            { productName: { $regex: searchTrimmed, $options: "i" } },
            { productDescription: { $regex: searchTrimmed, $options: "i" } },
            { productSubCategory: { $regex: searchTrimmed, $options: "i" } },
            { productCategory: { $regex: searchTrimmed, $options: "i" } },
            { shortDescription: { $regex: searchTrimmed, $options: "i" } },
          ],
        }
      : {};

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
