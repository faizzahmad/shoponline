import { connectToDb } from "@/lib/connectToDb";
import { verifyAuth } from "@/utils/verifyToken";
import Banner from "@/lib/models/banner";

type BannerBody = {
  type?: string;
  link?: string;
  image?: string;
  mobileImage?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
};

function normalizeBannerFields(body: BannerBody) {
  const type = body.type === "bottom" ? "bottom" : "top";
  const image = typeof body.image === "string" ? body.image.trim() : "";
  const mobileImage =
    typeof body.mobileImage === "string" ? body.mobileImage.trim() : "";
  const link = typeof body.link === "string" && body.link.trim() ? body.link.trim() : "/shop";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const subtitle = typeof body.subtitle === "string" ? body.subtitle.trim() : "";
  const ctaLabel =
    typeof body.ctaLabel === "string" && body.ctaLabel.trim()
      ? body.ctaLabel.trim()
      : "Shop now";

  return { type, image, mobileImage, link, title, subtitle, ctaLabel };
}

export async function POST(req: Request) {
  const isVerified = await verifyAuth();
  if (!isVerified.isValid) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  await connectToDb();
  try {
    const body = await req.json();
    const fields = normalizeBannerFields(body);

    if (!fields.image) {
      return new Response(JSON.stringify({ error: "Desktop image is required" }), { status: 400 });
    }
    if (!fields.title) {
      return new Response(JSON.stringify({ error: "Title is required" }), { status: 400 });
    }

    const newBanner = new Banner(fields);
    await newBanner.save();

    return new Response(
      JSON.stringify({ message: "Banner created successfully" }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating banner:", error);
    return new Response(JSON.stringify({ error: "Error creating banner" }), {
      status: 500,
    });
  }
}

export async function PUT(req: Request) {
  const isVerified = await verifyAuth();
  if (!isVerified.isValid) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  await connectToDb();
  try {
    const body = await req.json();
    const id = body.id;
    if (!id) {
      return new Response(JSON.stringify({ error: "ID is required" }), { status: 400 });
    }

    const fields = normalizeBannerFields(body);
    if (!fields.image) {
      return new Response(JSON.stringify({ error: "Desktop image is required" }), { status: 400 });
    }
    if (!fields.title) {
      return new Response(JSON.stringify({ error: "Title is required" }), { status: 400 });
    }

    const updatedBanner = await Banner.findByIdAndUpdate(id, fields, { new: true });
    if (!updatedBanner) {
      return new Response(JSON.stringify({ error: "Banner not found" }), { status: 404 });
    }

    return new Response(
      JSON.stringify({ message: "Banner updated successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating banner:", error);
    return new Response(JSON.stringify({ error: "Error updating banner" }), {
      status: 500,
    });
  }
}

export async function GET() {
  const isVerified = await verifyAuth();
  if (!isVerified.isValid) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  await connectToDb();
  try {
    const banners = await Banner.find({}).sort({ createdAt: -1 });
    return new Response(JSON.stringify(banners), { status: 200 });
  } catch (error) {
    console.error("Error fetching banners:", error);
    return new Response(JSON.stringify({ error: "Error fetching banners" }), {
      status: 500,
    });
  }
}

export async function DELETE(req: Request) {
  const isVerified = await verifyAuth();
  if (!isVerified.isValid) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  await connectToDb();
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return new Response(JSON.stringify({ error: "ID is required" }), { status: 400 });
  }

  try {
    const deletedBanner = await Banner.findByIdAndDelete(id);
    if (!deletedBanner) {
      return new Response(JSON.stringify({ error: "Banner not found" }), { status: 404 });
    }

    return new Response(
      JSON.stringify({ message: "Banner deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting banner:", error);
    return new Response(JSON.stringify({ error: "Error deleting banner" }), {
      status: 500,
    });
  }
}
