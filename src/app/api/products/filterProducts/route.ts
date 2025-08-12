import Product from "@/lib/models/product-model";
import { connectToDb } from "@/lib/connectToDb";

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
    // Build search query
    const searchQuery = search
      ? {
          $or: [
            { productName: { $regex: search, $options: "i" } },
            { productDescription: { $regex: search, $options: "i" } },
            { productSubCategory: { $regex: search, $options: "i" } },
            { productCategory: { $regex: search, $options: "i" } },
            { shortDescription: { $regex: search, $options: "i" } },
          ]
        }
      : {};

    // Final filter object
   const filter = {
  $and: [
    categories ? { productCategoryId: { $in: categories.split(",") } } : {},
    subCategories ? { productSubCategoryId: { $in: subCategories.split(",") } } : {},
    searchQuery,
  ]
};

    // Determine sort object
    let sortQuery: Record<string, 1 | -1> = { createdAt: -1 }; // default: New

    switch (sortBy) {
      case "top-selling":
        sortQuery = { totalSales: -1 }; // assuming "sold" is the field for top-selling
        break;
      case "lowToHigh":
        sortQuery = { originalPrice: 1 };
        break;
      case "highToLow":
        sortQuery = { originalPrice: -1 };
        break;
      case "new":
      default:
        sortQuery = { createdAt: -1 };
        break;
    }

    // Fetch products
    const products = await Product.find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    // Total count for pagination
    const totalProducts = await Product.countDocuments(filter);

    return new Response(JSON.stringify({
      products,
      totalProducts,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit)
    }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return new Response(JSON.stringify({ error: "Error fetching products" }), {
      status: 500,
    });
  }
}

