"use client"
import {useQueryState,parseAsBoolean,parseAsString} from 'nuqs';
export const useProductInfoModal = () => {
    const [isOpen, setIsOpen] = useQueryState(
        "open-product-info-modal",
        parseAsBoolean.withDefault(false).withOptions({clearOnDefault : true})
    );
    const [productId, setProductId] = useQueryState(
        "product-info-modal-id",
        parseAsString.withDefault("").withOptions({clearOnDefault : true})
    );

    const [isQuickBuy, setIsQuickBuy] = useQueryState(
        "is-quick-buy",
        parseAsBoolean.withDefault(false).withOptions({clearOnDefault : true})
    );


    const open = () => setIsOpen(true);
    const close = () => {
        setIsOpen(false);
        setProductId("");
        setIsQuickBuy(false);
    };
    return {
        isOpen,
        open,
        close,
        setIsOpen,
        productId,
        setProductId,
        isQuickBuy,
        setIsQuickBuy
    }
}