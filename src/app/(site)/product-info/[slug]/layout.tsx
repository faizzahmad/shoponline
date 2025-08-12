interface ProductLayoutProps {
    children: React.ReactNode;
}

const ProductLayout = ({ children }: ProductLayoutProps) => {
    return (
        <div>
           { children}
        </div>
    );
}

export default ProductLayout;