"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { fetchData } from "@/utils/apiCall";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useBannerAdmin } from "../hooks/user-banner";
import { BannerModal } from "./banner-modal";
import { BannerDeleteAlert } from "./banner-delete-alert";
import { FixedLoader } from "@/components/custom/fixed-loader";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Banner = {
  _id: string;
  type: string;
  link: string;
  image: string;
  mobileImage?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  createdAt: string;
  updatedAt: string;
};

export const BannerComponent = () => {
  const { openCreateModal, openEditModal, openDeleteAlert } = useBannerAdmin();
  const [bannerData, setBannerData] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handelFetchDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchData<Banner[]>("banner");
      if (response && Array.isArray(response)) {
        setBannerData(response);
      } else {
        console.error("Unexpected response format:", response);
        setBannerData([]);
      }
    } catch (err) {
      console.log(err);
      setBannerData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    handelFetchDetails();
  }, [handelFetchDetails]);

  const topBanners = bannerData.filter((b) => b.type === "top");
  const bottomBanners = bannerData.filter((b) => b.type === "bottom");

  return (
    <>
      {isLoading ? <FixedLoader /> : null}
      <BannerModal handelGetData={handelFetchDetails} banners={bannerData} />
      <BannerDeleteAlert onDeleted={handelFetchDetails} />

      <div className="w-full p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h5 className="text-2xl font-semibold exo">Banners</h5>
          <Button
            className="raleway flex items-center gap-2"
            onClick={openCreateModal}
          >
            <Plus className="size-4" />
            Add banner
          </Button>
        </div>

        <section className="mt-10">
          <h6 className="text-lg font-semibold raleway mb-4">
            Top carousel banners
          </h6>
          {topBanners.length === 0 ? (
            <p className="text-sm text-muted-foreground exo">
              No top banners yet. Add one to show on the homepage carousel.
            </p>
          ) : (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {topBanners.map((banner) => (
                <BannerCard
                  key={banner._id}
                  banner={banner}
                  onEdit={() => openEditModal(banner._id)}
                  onDelete={() => openDeleteAlert(banner._id)}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mt-12">
          <h6 className="text-lg font-semibold raleway mb-4">
            Bottom offer banners
          </h6>
          {bottomBanners.length === 0 ? (
            <p className="text-sm text-muted-foreground exo">
              No bottom banners yet. Add one for the mid-page offer section.
            </p>
          ) : (
            <div className="w-full grid grid-cols-1 gap-8">
              {bottomBanners.map((banner) => (
                <BannerCard
                  key={banner._id}
                  banner={banner}
                  wide
                  onEdit={() => openEditModal(banner._id)}
                  onDelete={() => openDeleteAlert(banner._id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
};

function BannerCard({
  banner,
  wide,
  onEdit,
  onDelete,
}: {
  banner: Banner;
  wide?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={cn("w-full", wide && "max-w-4xl")}>
      <div className="grid grid-cols-2 gap-2">
        <div className="w-full h-[180px] relative rounded-lg overflow-hidden bg-muted">
          <Image
            src={banner.image}
            alt={`${banner.title || "Banner"} desktop`}
            fill
            className="object-cover"
          />
          <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
            Desktop
          </span>
        </div>
        <div className="w-full h-[180px] relative rounded-lg overflow-hidden bg-muted">
          <Image
            src={banner.mobileImage || banner.image}
            alt={`${banner.title || "Banner"} mobile`}
            fill
            className="object-cover"
          />
          <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
            {banner.mobileImage ? "Mobile" : "Mobile (fallback)"}
          </span>
        </div>
      </div>
      <div className="mt-2">
        <p className="font-semibold raleway text-sm line-clamp-1">
          {banner.title || "Untitled banner"}
        </p>
        {banner.subtitle ? (
          <p className="text-muted-foreground text-xs line-clamp-1 mt-0.5">
            {banner.subtitle}
          </p>
        ) : null}
      </div>

      <div className="mt-3 flex gap-2">
        <Button
          variant="outline"
          className="flex-1 raleway gap-2"
          onClick={onEdit}
        >
          <Pencil className="size-3.5" />
          Edit
        </Button>
        <Button
          variant="outline"
          className="raleway gap-2 text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </div>

      <div className="mt-3 w-full raleway space-y-2">
        <div>
          <Label className="text-sm font-semibold ml-1">Link</Label>
          <Input type="text" disabled value={banner.link || ""} className="mt-1" />
        </div>
        <div>
          <Label className="text-sm font-semibold ml-1">CTA</Label>
          <Input
            type="text"
            disabled
            value={banner.ctaLabel || "Shop now"}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}
