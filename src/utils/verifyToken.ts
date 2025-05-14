
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET');
  return new TextEncoder().encode(secret);
}

export async function verifyAuth() {
   const cookieStore = await cookies();  
  const token = cookieStore.get('admin-token')?.value;

  if (!token) {
    return {
        isValid: false,
        message: 'Unauthorized: No token provided',
    }
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return {
        isValid: true,
        message: 'Token is valid',
        payload,
    };
  } catch (err) {
    return {
        isValid: false,
        message: 'Token is invalid or expired',
    }
  }
}
