import { connectToDb } from "@/lib/connectToDb";
import ShippingPackage from "@/lib/models/shipping-package-model";
import { verifyAuth } from "@/utils/verifyToken";

function parseDims(body: {
    length?: unknown;
    breadth?: unknown;
    height?: unknown;
    maxWeightGrams?: unknown;
}): { ok: true; length: number; breadth: number; height: number; maxWeightGrams: number | null } | { ok: false; error: string } {
    const length = Number(body.length);
    const breadth = Number(body.breadth);
    const height = Number(body.height);
    if (!Number.isFinite(length) || length <= 0) {
        return { ok: false, error: "Length is required (cm, > 0)" };
    }
    if (!Number.isFinite(breadth) || breadth <= 0) {
        return { ok: false, error: "Breadth is required (cm, > 0)" };
    }
    if (!Number.isFinite(height) || height <= 0) {
        return { ok: false, error: "Height is required (cm, > 0)" };
    }
    const rawMax = body.maxWeightGrams;
    let maxWeightGrams: number | null = null;
    if (rawMax !== undefined && rawMax !== null && rawMax !== "") {
        const w = Number(rawMax);
        if (!Number.isFinite(w) || w < 1) {
            return { ok: false, error: "Max weight must be at least 1 gram when provided" };
        }
        maxWeightGrams = w;
    }
    return { ok: true, length, breadth, height, maxWeightGrams };
}

export async function GET() {
    const isVrefied = await verifyAuth();
    if (!isVrefied.isValid) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    await connectToDb();
    try {
        const list = await ShippingPackage.find({})
            .sort({ sortOrder: 1, createdAt: -1 })
            .select("-__v")
            .lean();
        return new Response(JSON.stringify(list), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching packages:", error);
        return new Response(JSON.stringify({ error: "Error fetching packages" }), {
            status: 500,
        });
    }
}

export async function POST(request: Request) {
    const isVrefied = await verifyAuth();
    if (!isVrefied.isValid) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    await connectToDb();
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
        return new Response(JSON.stringify({ error: "Package name is required" }), {
            status: 400,
        });
    }
    const dims = parseDims(body);
    if (!dims.ok) {
        return new Response(JSON.stringify({ error: dims.error }), { status: 400 });
    }
    const sortOrder = Number(body.sortOrder);
    try {
        const docPayload: Record<string, unknown> = {
            name,
            length: dims.length,
            breadth: dims.breadth,
            height: dims.height,
            notes: typeof body.notes === "string" ? body.notes : "",
            sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
        };
        if (dims.maxWeightGrams !== null) {
            docPayload.maxWeightGrams = dims.maxWeightGrams;
        }
        const doc = new ShippingPackage(docPayload);
        await doc.save();
        return new Response(JSON.stringify({ message: "Package created successfully" }), {
            status: 201,
        });
    } catch (error) {
        console.error("Error creating package:", error);
        return new Response(JSON.stringify({ error: "Error creating package" }), {
            status: 500,
        });
    }
}

export async function PUT(request: Request) {
    const isVrefied = await verifyAuth();
    if (!isVrefied.isValid) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    await connectToDb();
    const body = await request.json();
    const _id = typeof body._id === "string" ? body._id : "";
    if (!_id) {
        return new Response(JSON.stringify({ error: "Missing package id" }), { status: 400 });
    }
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
        return new Response(JSON.stringify({ error: "Package name is required" }), {
            status: 400,
        });
    }
    const dims = parseDims(body);
    if (!dims.ok) {
        return new Response(JSON.stringify({ error: dims.error }), { status: 400 });
    }
    const sortOrder = Number(body.sortOrder);
    try {
        const setPayload: Record<string, unknown> = {
            name,
            length: dims.length,
            breadth: dims.breadth,
            height: dims.height,
            notes: typeof body.notes === "string" ? body.notes : "",
            sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
        };
        if (dims.maxWeightGrams !== null) {
            setPayload.maxWeightGrams = dims.maxWeightGrams;
        }
        const updateOp: {
            $set: Record<string, unknown>;
            $unset?: Record<string, string>;
        } = { $set: setPayload };
        if (dims.maxWeightGrams === null) {
            updateOp.$unset = { maxWeightGrams: "" };
        }
        const updated = await ShippingPackage.findByIdAndUpdate(_id, updateOp, {
            new: true,
        });
        if (!updated) {
            return new Response(JSON.stringify({ error: "Package not found" }), { status: 404 });
        }
        return new Response(JSON.stringify({ message: "Package updated successfully" }), {
            status: 200,
        });
    } catch (error) {
        console.error("Error updating package:", error);
        return new Response(JSON.stringify({ error: "Error updating package" }), {
            status: 500,
        });
    }
}

export async function DELETE(request: Request) {
    const isVrefied = await verifyAuth();
    if (!isVrefied.isValid) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    await connectToDb();
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
        return new Response(JSON.stringify({ error: "Missing package id" }), { status: 400 });
    }
    try {
        const deleted = await ShippingPackage.findByIdAndDelete(id);
        if (!deleted) {
            return new Response(JSON.stringify({ error: "Package not found" }), { status: 404 });
        }
        return new Response(JSON.stringify({ message: "Package deleted successfully" }), {
            status: 200,
        });
    } catch (error) {
        console.error("Error deleting package:", error);
        return new Response(JSON.stringify({ error: "Error deleting package" }), {
            status: 500,
        });
    }
}
