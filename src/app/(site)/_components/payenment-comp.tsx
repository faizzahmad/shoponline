"use client";
import React, { useEffect, useState } from "react";
import Script from "next/script";
declare global {
    interface Window {
        Razorpay: any;
    }
}

interface PaymentComponentProsp {
    amount : number;
    orderId?: string;
    
}

export const PaymentComponent = ({amount,orderId} : PaymentComponentProsp) => {

    

 const handlePayment = async () => {


  try {
    const response = await fetch("/api/razorpay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount * 100, // Razorpay expects paise
        currency: "INR",
        orderId: orderId,
      }),
    });

    const data = await response.json();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amount * 100,
      currency: "INR",
      name: "The Gift Box",
      description: "Payment for your order",
      order_id: data.id,
      handler: async (response: any) => {
        const absoluteUrl = `${process.env.NEXT_PUBLIC_API_URL}/invoice/${orderId}`;
        window.location.href = absoluteUrl;
      },
      theme: {
        color: "#e11d48",
      },
      modal: {
        ondismiss: function () {
          const cartUrl = `${process.env.NEXT_PUBLIC_API_URL}/cart`;
          window.location.href = cartUrl;
        },
      },
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  } catch (err) {
    console.error("Payment error:", err);
  }
};



    useEffect(() => {
        handlePayment();
    },[])

    return (
     <Script src="https://checkout.razorpay.com/v1/checkout.js" />
)
}


