'use client'

import { useQueryState, parseAsBoolean, parseAsString } from 'nuqs';

export const useAlertDialog = () => {
    const [isOpen, setIsOpen] = useQueryState(
        'delete-category-modal',
        parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
    );

    const [categoryId, setCategoryId] = useQueryState(
        'category-id',
        parseAsString.withDefault('').withOptions({ clearOnDefault: true })
    );

    const open = (id: string) => {
        setCategoryId(id);
        setIsOpen(true);
    };

    const close = () => {
        setIsOpen(false);
        setCategoryId(''); 
    };

    return {
        isOpen,
        categoryId,
        open,
        close,
        setIsOpen,
        setCategoryId,
    };
};
