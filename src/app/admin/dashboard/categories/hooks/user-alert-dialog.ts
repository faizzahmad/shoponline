'use client'

import { useQueryState, parseAsBoolean, parseAsString } from 'nuqs';

export const useAlertDialog = () => {
    const [isOpen, setIsOpenAlert] = useQueryState(
        'delete-category-modal',
        parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
    );

    const [categoryId, setCategoryId] = useQueryState(
        'category-id',
        parseAsString.withDefault('').withOptions({ clearOnDefault: true })
    );

    const open = (id: string) => {
        setCategoryId(id);
        setIsOpenAlert(true);
    };

    const close = () => {
        setIsOpenAlert(false);
        setCategoryId(''); 
    };

    return {
        isOpen,
        categoryId,
        open,
        close,
        setIsOpenAlert,
        setCategoryId,
    };
};
