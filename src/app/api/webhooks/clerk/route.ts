import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { connectToDb } from "@/lib/connectToDb";
import User from "@/lib/models/users-model";

export async function POST(req: Request) {
    await connectToDb();
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        throw new Error('Error: Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
    }

     // Get headers
     const headerPayload = await headers();
     const svix_id = headerPayload.get('svix-id');
     const svix_timestamp = headerPayload.get('svix-timestamp');
     const svix_signature = headerPayload.get('svix-signature');
 
     // If there are no headers, error out
     if (!svix_id || !svix_timestamp || !svix_signature) {
         return new Response('Error: Missing Svix headers', {
             status: 400,
         })
     }
 
     const payload = await req.json();
     const body = JSON.stringify(payload);
 
     const wh = new Webhook(WEBHOOK_SECRET);
     let evt: WebhookEvent;

     try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent
    } catch (err) {
        console.error('Error: Could not verify webhook:', err)
        return new Response('Error: Verification error', {
            status: 400,
        });
    };

    // Logic for handling the webhook event
    switch (evt.type) {
        case 'user.created':
    console.log({ "user.created": evt.data });
    const user = evt.data;
    const newUser = new User({
        firstName: user.first_name,
        lastName: user.last_name,
        phoneNumber: user.phone_numbers[0]?.phone_number, // optional chaining for safety
    });
    await newUser.save();
    break;
        case 'user.updated':
            console.log('User updated:', evt.data);
            break;
        case 'user.deleted':
            console.log('User deleted:', evt.data);
            break;
            default:
            console.log('Unhandled event type:', evt.type);
            break;
    }

   return new Response('Webhook received', {
        status: 200,
    });
}
