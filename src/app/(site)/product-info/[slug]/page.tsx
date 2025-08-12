import { ProductData } from "../_components/product-data";


const ProductPage = async ({
    params,
}: {
    params: Promise<{ slug: string }>
}) => {
    const { slug } = await params;
    
    return (
        <div className="w-full">
          <ProductData slug={slug}/>
        </div>
    );
}

export default ProductPage;



