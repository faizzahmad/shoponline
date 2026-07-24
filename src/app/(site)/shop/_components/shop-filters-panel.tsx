"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { fetchData } from "@/utils/apiCall";
import { useCategoryDropdown } from "./hooks/use-category-dropdown";
import { useSearch } from "../../_components/hooks/use-search";
import { cn } from "@/lib/utils";

type ShopFilterMeta = {
  priceRange: { min: number; max: number };
  attributes: Array<{
    name: string;
    options: Array<{ value: string; count: number }>;
  }>;
  totalProducts: number;
  filteredProducts: number;
  inStockCount: number;
  onSaleCount: number;
};

type ShopFiltersPanelProps = {
  className?: string;
  showHeading?: boolean;
};

export const ShopFiltersPanel = ({
  className,
  showHeading = true,
}: ShopFiltersPanelProps) => {
  const { search } = useSearch();
  const {
    category,
    subcategory,
    minPrice,
    maxPrice,
    inStock,
    onSale,
    setMinPrice,
    setMaxPrice,
    setInStock,
    setOnSale,
    setPage,
    clearProductFilters,
    hasProductFilters,
    variantFilterEntries,
    toggleVariantFilter,
    isVariantSelected,
  } = useCategoryDropdown();

  const [meta, setMeta] = useState<ShopFilterMeta | null>(null);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [draftMin, setDraftMin] = useState("");
  const [draftMax, setDraftMax] = useState("");
  const [sliderRange, setSliderRange] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingMeta(true);
      try {
        const params = new URLSearchParams({
          category: category.join(","),
          subcategory: subcategory.join(","),
          search: search ?? "",
        });
        if (minPrice != null) params.set("minPrice", String(minPrice));
        if (maxPrice != null) params.set("maxPrice", String(maxPrice));
        if (inStock) params.set("inStock", "true");
        if (onSale) params.set("onSale", "true");
        for (const entry of variantFilterEntries) {
          params.append("vf", entry);
        }

        const response = await fetchData<ShopFilterMeta>(
          `products/shop-filters?${params.toString()}`
        );
        if (cancelled || !response) return;

        setMeta(response);
        const boundsMin = response.priceRange.min;
        const boundsMax = Math.max(response.priceRange.max, boundsMin);

        const appliedMin = minPrice ?? boundsMin;
        const appliedMax = maxPrice ?? boundsMax;
        setDraftMin(String(appliedMin));
        setDraftMax(String(appliedMax));
        setSliderRange([appliedMin, appliedMax]);
      } catch (err) {
        console.error("Failed to load shop filters:", err);
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    category.join(","),
    subcategory.join(","),
    search,
    minPrice,
    maxPrice,
    inStock,
    onSale,
    variantFilterEntries.join(","),
  ]);

  const boundsMin = meta?.priceRange.min ?? 0;
  const boundsMax = Math.max(meta?.priceRange.max ?? 0, boundsMin);
  const hasPriceRange = boundsMax > boundsMin;

  const applyPriceFilter = () => {
    const nextMin = draftMin === "" ? null : Number(draftMin);
    const nextMax = draftMax === "" ? null : Number(draftMax);

    if (
      (nextMin != null && !Number.isFinite(nextMin)) ||
      (nextMax != null && !Number.isFinite(nextMax))
    ) {
      return;
    }

    setMinPrice(nextMin);
    setMaxPrice(nextMax);
    setPage(1);
  };

  const resetPriceDraft = () => {
    setMinPrice(null);
    setMaxPrice(null);
    setDraftMin(String(boundsMin));
    setDraftMax(String(boundsMax));
    setSliderRange([boundsMin, boundsMax]);
    setPage(1);
  };

  return (
    <div className={cn("w-full", className)}>
      {showHeading ? (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h5 className="exo text-lg font-[700] sm:text-xl">Filters</h5>
          {hasProductFilters ? (
            <button
              type="button"
              className="text-xs text-[#0F2744] underline underline-offset-2 raleway"
              onClick={clearProductFilters}
            >
              Clear all
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-6 border-t border-[#0F2744]/10 pt-4 first:border-t-0 first:pt-0">
        <div>
          <p className="mb-3 text-sm font-semibold text-[#0F2744] raleway">Price</p>
          {loadingMeta && !meta ? (
            <p className="text-xs text-muted-foreground">Loading price range…</p>
          ) : hasPriceRange ? (
            <div className="space-y-4">
              <Slider
                min={boundsMin}
                max={boundsMax}
                step={1}
                value={sliderRange}
                onValueChange={(value) => {
                  const [lo, hi] = value as [number, number];
                  setSliderRange([lo, hi]);
                  setDraftMin(String(lo));
                  setDraftMax(String(hi));
                }}
                className="py-2 [&_[role=slider]]:border-[#0F2744] [&_[role=slider]]:bg-white [&_.bg-primary]:bg-[#0F2744]"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="shop-min-price" className="text-xs text-muted-foreground">
                    Min (₹)
                  </Label>
                  <Input
                    id="shop-min-price"
                    type="number"
                    min={boundsMin}
                    max={boundsMax}
                    value={draftMin}
                    onChange={(e) => setDraftMin(e.target.value)}
                    className="mt-1 h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="shop-max-price" className="text-xs text-muted-foreground">
                    Max (₹)
                  </Label>
                  <Input
                    id="shop-max-price"
                    type="number"
                    min={boundsMin}
                    max={boundsMax}
                    value={draftMax}
                    onChange={(e) => setDraftMax(e.target.value)}
                    className="mt-1 h-9"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="flex-1 bg-[#0F2744] hover:bg-[#1B3F66]"
                  onClick={applyPriceFilter}
                >
                  Apply price
                </Button>
                {(minPrice != null || maxPrice != null) && (
                  <Button type="button" size="sm" variant="outline" onClick={resetPriceDraft}>
                    Reset
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Range: ₹{boundsMin.toLocaleString("en-IN")} – ₹
                {boundsMax.toLocaleString("en-IN")}
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No price data for current selection.</p>
          )}
        </div>

        {meta?.attributes && meta.attributes.length > 0 ? (
          <div className="space-y-5 border-t border-[#0F2744]/10 pt-4">
            <p className="text-sm font-semibold text-[#0F2744] raleway">Variants</p>
            {meta.attributes.map((attr) => (
              <div key={attr.name}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-600">
                  {attr.name}
                </p>
                <div className="flex flex-col gap-2">
                  {attr.options.map((option) => (
                    <label
                      key={`${attr.name}-${option.value}`}
                      className="flex cursor-pointer items-center gap-3"
                    >
                      <Checkbox
                        id={`vf-${attr.name}-${option.value}`}
                        checked={isVariantSelected(attr.name, option.value)}
                        onCheckedChange={(checked) =>
                          toggleVariantFilter(attr.name, option.value, Boolean(checked))
                        }
                        className="data-[state=checked]:border-[#0F2744] data-[state=checked]:bg-[#0F2744]"
                      />
                      <span className="flex flex-1 items-center justify-between gap-2 text-sm">
                        <span className="capitalize">{option.value}</span>
                        <span className="text-xs text-muted-foreground">
                          ({option.count})
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : !loadingMeta ? (
          <p className="text-xs text-muted-foreground border-t border-[#0F2744]/10 pt-4">
            No variant options for the current selection.
          </p>
        ) : null}

        <div>
          <p className="mb-3 text-sm font-semibold text-[#0F2744] raleway">Availability</p>
          <label className="flex cursor-pointer items-start gap-3">
            <Checkbox
              id="shop-in-stock"
              checked={inStock}
              onCheckedChange={(checked) => {
                setInStock(Boolean(checked));
                setPage(1);
              }}
              className="mt-0.5 data-[state=checked]:border-[#0F2744] data-[state=checked]:bg-[#0F2744]"
            />
            <span className="space-y-0.5">
              <span className="block text-sm font-medium">In stock only</span>
              {meta ? (
                <span className="block text-xs text-muted-foreground">
                  {meta.inStockCount} product{meta.inStockCount === 1 ? "" : "s"}
                </span>
              ) : null}
            </span>
          </label>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-[#0F2744] raleway">Offers</p>
          <label className="flex cursor-pointer items-start gap-3">
            <Checkbox
              id="shop-on-sale"
              checked={onSale}
              onCheckedChange={(checked) => {
                setOnSale(Boolean(checked));
                setPage(1);
              }}
              className="mt-0.5 data-[state=checked]:border-[#0F2744] data-[state=checked]:bg-[#0F2744]"
            />
            <span className="space-y-0.5">
              <span className="block text-sm font-medium">On sale</span>
              {meta ? (
                <span className="block text-xs text-muted-foreground">
                  {meta.onSaleCount} product{meta.onSaleCount === 1 ? "" : "s"}
                </span>
              ) : null}
            </span>
          </label>
        </div>

        {meta ? (
          <p className="text-xs text-muted-foreground border-t border-[#0F2744]/10 pt-3">
            Showing {meta.filteredProducts} of {meta.totalProducts} products
          </p>
        ) : null}
      </div>
    </div>
  );
};
