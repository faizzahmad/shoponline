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

export default clerkMiddleware(async (auth, request) => {
    const { pathname } = request.nextUrl;

    // Keep the crawlable search entry point consolidated on the shop catalog.
    if (pathname === "/search" || pathname.startsWith("/search/")) {
        const shopUrl = request.nextUrl.clone();
        shopUrl.pathname = "/shop";
        return NextResponse.redirect(shopUrl, 308);
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
