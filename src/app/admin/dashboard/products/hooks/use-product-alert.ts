'use client'

import { useQueryState, parseAsBoolean, parseAsString } from 'nuqs';

export const useProductDialog = () => {
    const [isOpen, setIsOpenAlert] = useQueryState(
        'delete-product-modal',
        parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
    );

    const [productId, setProductId] = useQueryState(
        'product-id',
        parseAsString.withDefault('').withOptions({ clearOnDefault: true })
    );


    const open = (id: string) => {
        setProductId(id);
        setIsOpenAlert(true);
    };

    const close = () => {
        setIsOpenAlert(false);
        setProductId(''); 
    };

    return {
        isOpen,
        productId,
        open,
        close,
        setIsOpenAlert,
        setProductId,
    };
};
