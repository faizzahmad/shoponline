"use client";
import { FixedLoader } from "@/components/custom/fixed-loader";
import { Button } from "@/components/ui/button";
import { useIsChanged } from "@/store/use-ischnaged";
import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { TfiShoppingCartFull } from "react-icons/tfi";
import { useCoupon } from "../../cart/_components/hooks/use-coupon";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


type productItems = {
    productId : string;
    quantity: number; 
    originalPrice : number;
    discountedPrice : number;
    productName  : string;
    images : string[];
    productCategory : string;
    productCategoryId : string;
    productSubCategory : string;
    productSubCategoryId : string;
    shortDescription : string;
    longDescription : string;
}

type OrdersDetails = {
    _id : string;
    username : string;
    userPhone : string;
    items : productItems[];
    totalAmount : number;
    orderDateTime : Date;
    couponCode? : string;
    deliveryAddress : string;
    streetAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    paymentMethod : string;
   orderStatus : string;
   deliveryStatus : string;
    razorpayOrderId : string;
    paymentStatus : string;
    createdAt : Date;
    updatedAt : Date;
    __v: number;
}


interface InvoiceDataProps {
    slug: string;
}

export const InvoiceData = ({slug} : InvoiceDataProps) => {
  const [orderDetails, setOrderDetails] = useState<OrdersDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
   const { isChanged, setIsChanged } = useIsChanged((state) => state);
        const { resetCouponCode } = useCoupon();
 const router = useRouter();
 const invoiceDivRef = useRef<HTMLDivElement>(null);
  const fetchOrderDetails = async () => {

    try {
      const response = await fetch(`/api/invoice?orderId=${slug}`);
      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }
      const data: OrdersDetails = await response.json();
      setOrderDetails(data);
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setIsChanged(!isChanged);
    resetCouponCode();
    fetchOrderDetails();
  }, [slug]);

const handleDownloadInvoice = async () => {
  if (!invoiceDivRef.current) return;

  const invoiceElement = invoiceDivRef.current;

  // Wait for canvas render
  const canvas = await html2canvas(invoiceElement, {
    scale: 2, // higher scale = better quality
    useCORS: true, // if you have remote images
  });

  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
const username = orderDetails?.username || "user";
const date = new Date(orderDetails?.orderDateTime || Date.now())
  .toISOString()
  .replace(/[:.]/g, "-"); // remove invalid filename characters

pdf.save(`invoice-${username}-${date}.pdf`);
};

    return(

<>

{
  loading && (
    <FixedLoader/>
  )
}
 <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 md:py-12">
           <div className="w-full flex justify-center">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left md:gap-8">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 sm:size-20 md:size-24">
                  <TfiShoppingCartFull className="size-8 sm:size-10 md:size-12" aria-hidden />
                </div>
                <div className="min-w-0">
                    <p className="exo text-lg font-bold tracking-tight text-gray-900 sm:text-xl md:text-2xl">Congratulations!</p>
                    <p className="exo mt-0.5 text-base font-semibold text-gray-600 sm:text-lg md:text-xl">Order placed successfully</p>
                    <div className="raleway mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start sm:gap-3">
                    <Button variant={'outline'} size="sm" className="sm:h-9" onClick={() => router.push('/shop')} >
                            Continue shopping
                        </Button>
                        <Button variant={'cart'} size="sm" className="rounded-md sm:h-9" onClick={handleDownloadInvoice}>
                            Download invoice
                        </Button>
                    </div>
                </div>
            </div>
            </div>


              <div className="raleway mt-8 w-full overflow-hidden rounded-xl sm:mt-10" ref={invoiceDivRef}>
               {/* Invoice */}
<div className="mx-auto max-w-4xl px-0 sm:px-1">
  <div className="mx-auto w-full">
    {/* Card */}
    <div className="flex flex-col rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-6 md:p-8">
      {/* Grid */}
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="shrink-0">
          <Image src={'/images/web/logo.svg'} alt="Logo" height={36} width={90} className="h-8 w-auto sm:h-9" />
        </div>

        <div className="min-w-0 sm:text-end">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">Invoice</h2>
          <span className="mt-1 block break-all text-xs text-gray-500 exo sm:text-sm">{orderDetails?._id}</span>

          <address className="mt-3 not-italic text-xs leading-relaxed text-gray-600 sm:mt-4 sm:text-sm">
           Lal bagh purnea city <br />
            Purnea, Bihar  854301,<br />
            India<br />
          </address>
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:mt-6 sm:grid-cols-2 sm:gap-6">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Bill to</h3>
          <p className="mt-1.5 text-base font-semibold capitalize text-gray-900 sm:text-lg">
            {orderDetails?.username}
          </p>
          <address className="mt-2 not-italic text-sm leading-relaxed text-gray-600 whitespace-pre-line">
         {
          orderDetails?.deliveryAddress
         }
          </address>
        </div>

        <div className="sm:text-end">
          <dl className="inline-block text-left sm:text-right">
            <div className="flex flex-col gap-0.5 sm:items-end">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Order date</dt>
{
  orderDetails?.orderDateTime && (
    <dd className="text-sm text-gray-800 exo">
                {
                  format(new Date(orderDetails?.orderDateTime), "dd/MM/yyyy")
                }
              </dd>
  )
}
            </div>
          </dl>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 sm:mt-6">
        <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50/40 p-3 sm:p-4">
          <div className="hidden grid-cols-[minmax(0,1.2fr)_0.5fr_0.7fr_0.85fr] gap-2 border-b border-gray-200 pb-2 sm:grid">
            <div className="text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs">Item</div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs">Qty</div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs">Rate</div>
            <div className="text-end text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs">Amount</div>
          </div>

        {
          orderDetails?.items.map((item) => (
            <React.Fragment key={item.productId}>
                <div className="hidden border-b border-gray-100 sm:block" />

          <div className="grid grid-cols-1 gap-3 rounded-md border border-gray-100 bg-white p-3 sm:grid-cols-[minmax(0,1.2fr)_0.5fr_0.7fr_0.85fr] sm:gap-2 sm:border-0 sm:bg-transparent sm:p-0">
            <div className="min-w-0 sm:col-span-1">
              <h5 className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:hidden">Item</h5>
              <p className="text-sm font-medium leading-snug text-gray-900 sm:text-[15px]">{item.productName}</p>
            </div>
            <div className="flex items-baseline justify-between gap-2 sm:block">
              <h5 className="text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:hidden">Qty</h5>
              <p className="text-sm tabular-nums text-gray-800 exo sm:text-[15px]">
                {item.quantity}
              </p>
            </div>
            <div className="flex items-baseline justify-between gap-2 sm:block">
              <h5 className="text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:hidden">Rate</h5>
              <p className="text-sm tabular-nums text-gray-800 exo sm:text-[15px]">
                {item.originalPrice}
              </p>
            </div>
            <div className="flex items-baseline justify-between gap-2 border-t border-gray-100 pt-2 sm:block sm:border-0 sm:pt-0">
              <h5 className="text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:hidden">Amount</h5>
              <p className="text-sm tabular-nums text-gray-900 exo sm:text-end sm:text-[15px]">
                {(item.originalPrice * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
            </React.Fragment>
          ))
        }

          



          
        </div>
      </div>
      {/* End Table */}

      <div className="mt-6 flex sm:mt-8 sm:justify-end">
        <div className="w-full max-w-sm sm:text-end">
          <dl className="space-y-2.5 text-sm">
            <div className="flex items-baseline justify-between gap-4 border-b border-gray-100 pb-2.5">
              <dt className="raleway font-medium text-gray-600">Total price</dt>
              <dd>
              <span className="tabular-nums text-gray-700 exo">
                {"\u20B9"} {
                  orderDetails?.items.reduce((total, item) => total + (item.originalPrice * item.quantity), 0).toFixed(2)
                }
              </span>
              </dd>
            </div>

            <div className="flex items-baseline justify-between gap-4 border-b border-gray-100 pb-2.5">
              <dt className="raleway font-medium text-gray-600">Shipping</dt>
              <dd>
              <span className="font-medium text-emerald-600 exo">
               Free
              </span>
              </dd>
            </div>

           {
            orderDetails?.totalAmount && (
            <div className="flex items-baseline justify-between gap-4 border-b border-gray-100 pb-2.5">
              <dt className="raleway font-medium text-gray-600">Discount</dt>
              <dd>
              <span className="tabular-nums text-rose-600 exo">
                {"\u20B9"} {
                 (orderDetails?.items.reduce((total, item) => total + (item.originalPrice * item.quantity), 0) - orderDetails?.totalAmount ).toFixed(2)
                }
              </span>
              </dd>
            </div>
            )
           }

            <div className="flex items-baseline justify-between gap-4 pt-1">
              <dt className="raleway text-base font-semibold text-gray-900">Subtotal</dt>
              <dd>
              <span className="text-base font-semibold tabular-nums text-gray-900 exo">
                {"\u20B9"} {
                  (orderDetails?.totalAmount)?.toFixed(2)
                }
              </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
          {/* Grid */}
          {/* <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-2">
            
            <dl className="grid sm:grid-cols-5 gap-x-3">
              <dt className="col-span-3 font-semibold text-gray-800">Total Price
:</dt>
              <dd className="col-span-2 text-gray-500  exo">$2750.00</dd>
            </dl>

            <dl className="grid sm:grid-cols-5 gap-x-3">
              <dt className="col-span-3 font-semibold text-gray-800">Shipping Fee</dt>
              <dd className="col-span-2 text-gray-500 exo">$2750.00</dd>
            </dl>

            <dl className="grid sm:grid-cols-5 gap-x-3">
              <dt className="col-span-3 font-semibold text-gray-800">Discount Price
</dt>
              <dd className="col-span-2 text-gray-500 first-letter exo"> {"\u20B9"} 39.00</dd>
            </dl>

           

            <dl className="grid sm:grid-cols-5 gap-x-3">
              <dt className="col-span-3 font-semibold text-gray-800">Subtotal </dt>
              <dd className="col-span-2 text-gray-500 exo">{"\u20B9"} 0.00</dd>
            </dl>
          </div> */}
          {/* End Grid */}

      <div className="mt-6 rounded-lg bg-gray-50/80 p-4 sm:mt-8 sm:p-5">
        <h4 className="text-base font-semibold text-gray-900">Thank you!</h4>
        <p className="mt-1.5 text-sm leading-relaxed text-gray-600">Questions about this invoice? Reach us at:</p>
        <div className="mt-3 space-y-1">
          <p className="text-sm font-medium text-gray-800">john.doe@example.com</p>
          <p className="text-sm font-medium text-gray-800">+1 202-555-0143</p>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-gray-500 sm:mt-5 sm:text-left">{"\u00A9"} 2026 Buyora</p>
    </div>
    
  </div>
</div>

            </div>
        </div>

</>
    )
}