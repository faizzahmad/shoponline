"use client";
import { useQueryState, parseAsString } from 'nuqs';

export const useCategory = () => {
   
    const [categoryIdforSubcat, setCategoryIdforSubcat] = useQueryState(
        'categoryId',
        parseAsString.withDefault('').withOptions({ clearOnDefault: true })
    );

    return {
        categoryIdforSubcat,
        setCategoryIdforSubcat,
    };
};
