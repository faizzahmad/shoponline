import type { Metadata } from "next";
import { InvoiceData } from "../_components/invoice-data";

export const metadata: Metadata = {
    title: "Order invoice",
    description: "Order confirmation and invoice details for your Najak Clothing purchase.",
    robots: { index: false, follow: false },
};

const InvoicePage = async (
  {
    params,
  }: {
    params: Promise<{ slug: string }>;
  }
) => {
  const { slug } = await params;


  return (
    <div>
      <InvoiceData slug={slug} />
    </div>
  );
};

export default InvoicePage;
