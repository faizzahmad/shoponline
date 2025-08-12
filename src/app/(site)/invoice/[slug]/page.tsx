
import { InvoiceData } from "../_components/invoice-data";

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
