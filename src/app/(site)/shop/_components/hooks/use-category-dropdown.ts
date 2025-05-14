import { useQueryState, parseAsString, parseAsArrayOf } from 'nuqs';

export const useCategoryDropdown = () => {
    const [category, setCategory] = useQueryState(
        'category',
        parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true })
    );

    const [subcategory, setSubcategory] = useQueryState(
        'subcategory',
        parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true })
    );

    return {
        category,
        subcategory,
        setCategory,
        setSubcategory,
    };
};
