"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { toast } from "sonner";

declare global {
    interface Window {
        Razorpay: new (options: Record<string, unknown>) => { open: () => void };
    }
}

interface PaymentComponentProsp {
    amount: number;
    orderId?: string;
    /** Fires as soon as payment succeeds, while verification + redirect run (can take a few seconds). */
    onPaymentRedirecting?: () => void;
    onPaymentVerifyFailed?: () => void;
}

export const PaymentComponent = ({
    amount,
    orderId,
    onPaymentRedirecting,
    onPaymentVerifyFailed,
}: PaymentComponentProsp) => {
    const [scriptReady, setScriptReady] = useState(false);
    const openedRef = useRef(false);

    const openCheckout = useCallback(async () => {
        if (!orderId || openedRef.current) return;
        openedRef.current = true;

        try {
            const response = await fetch("/api/razorpay", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: Math.round(amount * 100),
                    currency: "INR",
                    orderId,
                }),
            });

            const data = await response.json();
            if (!response.ok || !data?.id) {
                openedRef.current = false;
                toast.error(data?.error || "Could not start payment. Try again.");
                return;
            }

            const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: data.amount,
                currency: data.currency ?? "INR",
                name: "Buyora",
                description: "Payment for your order",
                order_id: data.id,
                handler: async (paymentResponse: {
                    razorpay_payment_id: string;
                    razorpay_order_id: string;
                    razorpay_signature: string;
                }) => {
                    onPaymentRedirecting?.();
                    try {
                        const verifyRes = await fetch("/api/razorpay/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                ...paymentResponse,
                                orderId,
                            }),
                        });

                        if (!verifyRes.ok) {
                            onPaymentVerifyFailed?.();
                            const err = await verifyRes.json().catch(() => ({}));
                            openedRef.current = false;
                            toast.error(
                                typeof err?.error === "string"
                                    ? err.error
                                    : "Payment could not be verified. Contact support with your order ID."
                            );
                            return;
                        }

                        window.location.href = `${baseUrl}/invoice/${orderId}`;
                    } catch {
                        onPaymentVerifyFailed?.();
                        openedRef.current = false;
                        toast.error("Could not verify payment. Please try again.");
                    }
                },
                theme: {
                    color: "#e11d48",
                },
                modal: {
                    ondismiss: () => {
                        openedRef.current = false;
                        window.location.href = `${baseUrl}/cart`;
                    },
                },
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.open();
        } catch (err) {
            openedRef.current = false;
            console.error("Payment error:", err);
            toast.error("Something went wrong. Please try again.");
        }
    }, [amount, orderId, onPaymentRedirecting, onPaymentVerifyFailed]);

    useEffect(() => {
        if (!scriptReady || !orderId) return;
        void openCheckout();
    }, [scriptReady, orderId, openCheckout]);

    return (
        <Script
            src="https://checkout.razorpay.com/v1/checkout.js"
            onLoad={() => setScriptReady(true)}
            strategy="afterInteractive"
        />
    );
};
