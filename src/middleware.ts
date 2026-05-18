import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/",
    "/api/webhooks(.*)",
    "/api/category(.*)",
    "/shop",
    "/admin(.*)",
    "/api/admin-login",
    "/api/admin-logout",
    "/api/uploadthing(.*)",
    "/api/products(.*)",
    "/api/banner(.*)",
    "/api/cart(.*)",
    "/cart",
    "/api/coupon(.*)",
    "/api/order(.*)",
    "/api/users(.*)",
    "/api/dashboard-stats(.*)",
    "/api/reviews(.*)",
    "/api/related-products(.*)",
    "/product-info(.*)",
    "/search(.*)",
    "/invoice(.*)",
    "/api/invoice(.*)",
    "/api/razorpay(.*)",
    "/api/packages(.*)",
]);

function isMobileUserAgent(userAgent: string | null): boolean {
    if (!userAgent) return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
        userAgent
    );
}

export default clerkMiddleware(async (auth, request) => {
    const { pathname, searchParams } = request.nextUrl;

    // Mobile-only search UI — send desktop visitors to the shop catalog.
    if (pathname === "/search" || pathname.startsWith("/search/")) {
        if (!isMobileUserAgent(request.headers.get("user-agent"))) {
            const shopUrl = request.nextUrl.clone();
            shopUrl.pathname = "/shop";
            const query = searchParams.get("search");
            if (query) {
                shopUrl.searchParams.set("search", query);
            } else {
                shopUrl.searchParams.delete("search");
            }
            return NextResponse.redirect(shopUrl);
        }
    }

    if (!isPublicRoute(request)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
