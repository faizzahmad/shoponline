import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { connectToDb } from "@/lib/connectToDb";
import User from "@/lib/models/users-model";

type ClerkEmailAddr = { id: string; email_address: string };
type ClerkUserPayload = {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email_addresses?: ClerkEmailAddr[];
    primary_email_address_id?: string | null;
    phone_numbers?: Array<{ phone_number: string }>;
};

function primaryEmailFromClerkUser(user: ClerkUserPayload): string {
    const list = user.email_addresses ?? [];
    const primaryId = user.primary_email_address_id;
    const picked =
        (primaryId ? list.find((e) => e.id === primaryId) : undefined) ?? list[0];
    return (picked?.email_address ?? "").trim().toLowerCase();
}

async function upsertUserFromClerk(user: ClerkUserPayload) {
    const email = primaryEmailFromClerkUser(user);
    if (!email) {
        console.warn("[Clerk webhook] Skipping user sync: no email on payload", user.id);
        return;
    }
    const firstName = (user.first_name ?? "").trim() || "User";
    const lastName = (user.last_name ?? "").trim() || "";
    const phoneNumber = user.phone_numbers?.[0]?.phone_number?.trim() ?? "";

    await User.findOneAndUpdate(
        { email },
        {
            $set: {
                firstName,
                lastName,
                phoneNumber,
            },
        },
        { upsert: true, new: true }
    );
}

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        throw new Error(
            "Add CLERK_WEBHOOK_SECRET from Clerk Dashboard → Webhooks → your endpoint → Signing secret"
        );
    }

    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Error: Missing Svix headers", {
            status: 400,
        });
    }

    // Svix signs the exact raw bytes — never verify after JSON.parse + stringify (that breaks the signature).
    const body = await req.text();

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error("Error: Could not verify webhook:", err);
        return new Response("Error: Verification error", {
            status: 400,
        });
    }

    await connectToDb();

    switch (evt.type) {
        case "user.created":
            console.log({ "user.created": evt.data });
            await upsertUserFromClerk(evt.data as ClerkUserPayload);
            break;
        case "user.updated":
            await upsertUserFromClerk(evt.data as ClerkUserPayload);
            break;
        case "user.deleted":
            console.log("User deleted:", evt.data);
            break;
        default:
            console.log("Unhandled event type:", evt.type);
            break;
    }

    return new Response("Webhook received", {
        status: 200,
    });
}
