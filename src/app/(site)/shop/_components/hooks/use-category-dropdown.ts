import { useQueryState, parseAsString, parseAsArrayOf,parseAsInteger } from 'nuqs';

export const useCategoryDropdown = () => {
    const [category, setCategory] = useQueryState(
        'category',
        parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true })
    );

    const [subcategory, setSubcategory] = useQueryState(
        'subcategory',
        parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true })
    );

    const [sortBy, setSortBy] = useQueryState(
        'sortBy',
        parseAsString.withDefault('recommended').withOptions({ clearOnDefault: true })
    );


    const [page, setPage] = useQueryState(
        'page',
        parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true })
    );

   
    // Function to reset filters
    return {
        category,
        subcategory,
        setCategory,
        setSubcategory,
        sortBy,
        setSortBy,
        page,
        setPage,
    };
};
