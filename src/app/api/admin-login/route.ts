import { connectToDb } from "@/lib/connectToDb";
import Admin from "@/lib/models/admin-model";
import { hashPassword, verifyPassword } from '@/lib/hash';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET');
  return new TextEncoder().encode(secret);
}

export async function GET(request: Request) {
  await connectToDb();
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const password = searchParams.get('password');

  try {
    const findAdmin = await Admin.findOne({ email });

    if (!findAdmin) {
      return new Response("Admin not found", { status: 404 });
    }

    const isPasswordValid = await verifyPassword(password!, findAdmin.password);
    if (!isPasswordValid) {
      return new Response("Invalid password", { status: 401 });
    }

  
    const token = await new SignJWT({ email: findAdmin.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(getJwtSecretKey());

    const cookieStore = await cookies();
    cookieStore.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return new Response(JSON.stringify({ message: "Login successful", token }), {
      status: 200,
    });

  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
    await connectToDb();
    const { email, password } = await request.json();
    try {
        await Admin.create({
            email,
            password: await hashPassword(password)
        });
        return new Response(JSON.stringify({ message: "Admin created successfully" }), {
            status: 201,
        });

    } catch (error) {
        return new Response("Internal Server Error", { status: 500 });
    }

}