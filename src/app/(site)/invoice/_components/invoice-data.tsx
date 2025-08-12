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
 <div className="md:p-32 p-5">
           <div className="w-full flex justify-center">
            <div className="flex gap-10 items-center">
                <TfiShoppingCartFull  className="size-[150px]"/>
                <div>
                    <h4 className="exo text-3xl font-[700]">Congratulations ! </h4>
                    <h4 className="exo text-3xl font-[700] mt-1">Order Placed Successfully</h4>
                    <div className="flex gap-4 raleway mt-4">
                    <Button variant={'outline'} onClick={() => router.push('/shop')} >
                            Continue Shopping
                        </Button>
                        <Button variant={'cart'} className="rounded" onClick={handleDownloadInvoice}>
                            Download Invoice
                        </Button>
                    </div>
                </div>
            </div>
            </div>


              <div className="w-full mt-10 rounded overflow-hidden raleway" ref={invoiceDivRef}>
               {/* Invoice */}
<div className="max-w-[85rem] px-4 sm:px-6 lg:px-8 mx-auto my-4 sm:my-10" >
  <div className="sm:w-11/12 lg:w-3/4 mx-auto">
    {/* Card */}
    <div className="flex flex-col p-4 sm:p-10 bg-white shadow-md rounded-xl border">
      {/* Grid */}
      <div className="flex justify-between">
        <div>
          <Image src={'/images/web/logo.svg'} alt="Logo" height={40} width={100}></Image>
        </div>
        {/* Col */}

        <div className="text-end">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">Invoice </h2>
          <span className="mt-1 block text-gray-500 exo">{orderDetails?._id}</span>

          <address className="mt-4 not-italic text-gray-800">
           Lal bagh purnea city <br />
            Purnea, Bihar  854301,<br />
            India<br />
          </address>
        </div>
        {/* Col */}
      </div>
      {/* End Grid */}

      {/* Grid */}
      <div className="mt-8 grid sm:grid-cols-2 gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Bill to:</h3>
          <h3 className="text-lg font-semibold text-gray-800 capitalize">
            {orderDetails?.username}
          </h3>
          <address className="mt-2 not-italic text-gray-500">
         {
          orderDetails?.deliveryAddress
         }
          </address>
        </div>
        {/* Col */}

        <div className="sm:text-end space-y-2">
          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-2">
            <dl className="grid sm:grid-cols-5 gap-x-3">
              <dt className="col-span-3 font-semibold text-gray-800">Order Date:</dt>
{
  orderDetails?.orderDateTime && (
    <dd className="col-span-2 text-gray-500 exo">
                {
                  format(new Date(orderDetails?.orderDateTime), "dd/MM/yyyy")
                }
              </dd>
  )
}
            </dl>
           
          </div>
          {/* End Grid */}
        </div>
        {/* Col */}
      </div>
      {/* End Grid */}

      {/* Table */}
      <div className="mt-6">
        <div className="border border-gray-200 p-4 rounded-lg space-y-4">
          <div className="hidden sm:grid sm:grid-cols-5">
            <div className="sm:col-span-2 text-xs font-medium text-gray-500 uppercase">Item</div>
            <div className="text-start text-xs font-medium text-gray-500 uppercase">Qty</div>
            <div className="text-start text-xs font-medium text-gray-500 uppercase">Rate</div>
            <div className="text-end text-xs font-medium text-gray-500 uppercase">Amount</div>
          </div>

        {
          orderDetails?.items.map((item) => (
            <React.Fragment key={item.productId}>
                <div className="hidden sm:block border-b border-gray-200"></div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            <div className="col-span-full sm:col-span-2">
              <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">Item</h5>
              <p className="font-medium text-gray-800">{item.productName}</p>
            </div>
            <div>
              <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">Qty</h5>
              <p className="text-gray-800 exo">
                {item.quantity}
              </p>
            </div>
            <div>
              <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">Rate</h5>
              <p className="text-gray-800 exo">
                {item.originalPrice}
              </p>
            </div>
            <div>
              <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">Amount</h5>
              <p className="sm:text-end text-gray-800 exo">
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

      {/* Flex */}
      <div className="mt-8 flex sm:justify-end">
        <div className="w-full max-w-2xl sm:text-end space-y-2">
          <div className="mt-5 flex">
            <div className="ms-auto grid grid-cols-1 gap-4">
            <div className="flex gap-4">
            <h5 className="raleway text-gray-800 font-semibold w-52">
              Total Price :
            </h5>
            <h6>
              <span className="text-gray-500 exo">
                {"\u20B9"} {
                  orderDetails?.items.reduce((total, item) => total + (item.originalPrice * item.quantity), 0).toFixed(2)
                }
              </span>
            </h6>
            </div>


             <div className="flex gap-4">
            <h5 className="raleway text-gray-800 font-semibold w-52">
             Shipping Fee :
            </h5>
            <h6>
              <span className="text-green-500 exo">
               Free
              </span>
            </h6>
            </div>


             <div className="flex gap-4">
            <h5 className="raleway text-gray-800 font-semibold w-52">
             Discount Price :
            </h5>
           {
            orderDetails?.totalAmount && (
               <h6>
              <span className="text-rose-500 exo">
                {"\u20B9"} {
                 (orderDetails?.items.reduce((total, item) => total + (item.originalPrice * item.quantity), 0) - orderDetails?.totalAmount ).toFixed(2)
                }
              </span>
            </h6>
            )
           }
            </div>
        
             <div className="flex gap-4 border-t pt-3">
            <h5 className="raleway text-gray-800 font-semibold w-52 text-lg">
            Subtotal :
            </h5>
            <h6>
              <span className="text-black font-semibold exo text-lg">
                {"\u20B9"} {
                  (orderDetails?.totalAmount)?.toFixed(2)
                }
              </span>
            </h6>
            </div>
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
        </div>
      </div>
      {/* End Flex */}

      <div className="mt-8 sm:mt-12">
        <h4 className="text-lg font-semibold text-gray-800">Thank you!</h4>
        <p className="text-gray-500">If you have any questions concerning this invoice, use the following contact information:</p>
        <div className="mt-2">
          <p className="block text-sm font-medium text-gray-800">example@site.com</p>
          <p className="block text-sm font-medium text-gray-800">+1 (062) 109-9222</p>
        </div>
      </div>

      <p className="mt-5 text-sm text-gray-500">{"\u00A9"} 2025 The gift box</p>
    </div>
    
  </div>
</div>

            </div>
        </div>

</>
    )
}