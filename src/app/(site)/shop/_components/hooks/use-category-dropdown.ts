import {
  useQueryState,
  parseAsString,
  parseAsArrayOf,
  parseAsInteger,
  parseAsBoolean,
} from "nuqs";
import {
  parseVariantFilterParam,
  serializeVariantFilters,
} from "@/lib/shop-product-filter";

export const useCategoryDropdown = () => {
  const [category, setCategory] = useQueryState(
    "category",
    parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true })
  );

  const [subcategory, setSubcategory] = useQueryState(
    "subcategory",
    parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true })
  );

  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsString.withDefault("recommended").withOptions({ clearOnDefault: true })
  );

  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true })
  );

  const [minPrice, setMinPrice] = useQueryState(
    "minPrice",
    parseAsInteger.withOptions({ clearOnDefault: true })
  );

  const [maxPrice, setMaxPrice] = useQueryState(
    "maxPrice",
    parseAsInteger.withOptions({ clearOnDefault: true })
  );

  const [inStock, setInStock] = useQueryState(
    "inStock",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );

  const [onSale, setOnSale] = useQueryState(
    "onSale",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );

  const [variantFilterEntries, setVariantFilterEntries] = useQueryState(
    "vf",
    parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true })
  );

  const variantFilters = parseVariantFilterParam(variantFilterEntries);

  const toggleVariantFilter = (name: string, value: string, checked: boolean) => {
    const next = { ...variantFilters };
    const current = new Set(next[name] ?? []);
    if (checked) current.add(value);
    else current.delete(value);
    if (current.size === 0) delete next[name];
    else next[name] = [...current];
    setVariantFilterEntries(serializeVariantFilters(next));
    setPage(1);
  };

  const isVariantSelected = (name: string, value: string) =>
    (variantFilters[name] ?? []).includes(value);

  const clearProductFilters = () => {
    setMinPrice(null);
    setMaxPrice(null);
    setInStock(false);
    setOnSale(false);
    setVariantFilterEntries([]);
    setPage(1);
  };

  const hasProductFilters =
    minPrice != null ||
    maxPrice != null ||
    inStock ||
    onSale ||
    variantFilterEntries.length > 0;

  return {
    category,
    subcategory,
    setCategory,
    setSubcategory,
    sortBy,
    setSortBy,
    page,
    setPage,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    inStock,
    setInStock,
    onSale,
    setOnSale,
    variantFilters,
    variantFilterEntries,
    setVariantFilterEntries,
    toggleVariantFilter,
    isVariantSelected,
    clearProductFilters,
    hasProductFilters,
  };
};
