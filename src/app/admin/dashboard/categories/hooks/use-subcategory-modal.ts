"use client"
import {useQueryState,parseAsBoolean} from 'nuqs';
export const useCreateSubCategoryModal = () => {
    const [isOpen, setIsOpen] = useQueryState(
        "create-subcategory-modal",
        parseAsBoolean.withDefault(false).withOptions({clearOnDefault : true})
    );

    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);
    return {
        isOpen,
        open,
        close,
        setIsOpen,
    }
}