"use client";

import { CustomModal } from "@/components/custom/custom-modal";
import { DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { ImagePlus, Loader } from "lucide-react";
import { emptyBannerForm, useBannerAdmin, type BannerFormValues } from "../hooks/user-banner";
import { useEffect, useState } from "react";
import { UploadButton } from "@/utils/uploadthing";
import { postData, updateDataWithData } from "@/utils/apiCall";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BannerModalProps {
  handelGetData: () => void;
  banners: Array<{
    _id: string;
    type: string;
    link: string;
    image: string;
    mobileImage?: string;
    title?: string;
    subtitle?: string;
    ctaLabel?: string;
  }>;
}

type ApiResponse = {
  message: string;
};

function BannerImageField({
  label,
  hint,
  value,
  changing,
  onChangeStart,
  onCancel,
  onUploaded,
  onClear,
}: {
  label: string;
  hint: string;
  value: string;
  changing: boolean;
  onChangeStart: () => void;
  onCancel: () => void;
  onUploaded: (url: string) => void;
  onClear?: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold">{label}</Label>
      <p className="text-xs text-neutral-500">{hint}</p>
      {value && !changing ? (
        <div className="relative w-full h-[120px] overflow-hidden rounded-lg border border-dashed border-neutral-300 bg-muted">
          <Image src={value} alt={label} fill className="object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-gradient-to-t from-black/50 to-transparent py-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="raleway bg-white/95"
              onClick={onChangeStart}
            >
              Change
            </Button>
            {onClear ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="raleway bg-white/95"
                onClick={onClear}
              >
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 bg-slate-50 px-4 py-5 text-center">
            <div className="flex size-9 items-center justify-center rounded-full bg-[#0F2744]/10 text-[#0F2744]">
              <ImagePlus className="size-4" />
            </div>
            <p className="text-sm font-medium text-neutral-800">Upload image</p>
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res && res.length > 0) onUploaded(res[0].ufsUrl);
              }}
              onUploadError={(error) => {
                toast.error(error.message);
              }}
              appearance={{
                button:
                  "bg-[#0F2744] text-white text-sm px-4 h-8 ut-ready:bg-[#0F2744] ut-uploading:bg-[#0F2744]/80 after:bg-[#0F2744]",
                allowedContent: "hidden",
              }}
            />
          </div>
          {changing && value ? (
            <div className="flex justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export const BannerModal = ({ handelGetData, banners }: BannerModalProps) => {
  const { editModal, closeEditModal, bannerId } = useBannerAdmin();
  const [isLoading, setIsLoading] = useState(false);
  const [isChangeDesktop, setIsChangeDesktop] = useState(false);
  const [isChangeMobile, setIsChangeMobile] = useState(false);
  const [form, setForm] = useState<BannerFormValues>(emptyBannerForm());

  const isEdit = Boolean(bannerId);

  useEffect(() => {
    if (!editModal) return;

    if (bannerId) {
      const existing = banners.find((b) => b._id === bannerId);
      if (existing) {
        setForm({
          type: existing.type === "bottom" ? "bottom" : "top",
          image: existing.image || "",
          mobileImage: existing.mobileImage || "",
          link: existing.link || "/shop",
          title: existing.title || "",
          subtitle: existing.subtitle || "",
          ctaLabel: existing.ctaLabel || "Shop now",
        });
      }
    } else {
      setForm(emptyBannerForm());
    }
    setIsChangeDesktop(false);
    setIsChangeMobile(false);
  }, [editModal, bannerId, banners]);

  const updateField = <K extends keyof BannerFormValues>(key: K, value: BannerFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.image) {
      toast.error("Please upload a desktop banner image");
      return;
    }
    if (!form.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!form.link.trim()) {
      toast.error("Please enter a link");
      return;
    }

    setIsLoading(true);
    try {
      if (isEdit) {
        const response = await updateDataWithData<
          typeof form & { id: string },
          ApiResponse
        >("banner", { id: bannerId, ...form });
        if (response?.message) {
          toast.success(response.message);
          handelGetData();
          closeEditModal();
        }
      } else {
        const response = await postData<typeof form, ApiResponse>("banner", form);
        if (response?.message) {
          toast.success(response.message);
          handelGetData();
          closeEditModal();
        }
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CustomModal
      open={editModal}
      onOpenChange={(open) => {
        if (!open) closeEditModal();
      }}
      className="max-w-3xl w-[min(92vw,48rem)] max-h-[85vh] overflow-y-auto gap-3 p-5 sm:p-6"
    >
      <DialogHeader>
        <DialogTitle asChild>
          <h5 className="text-xl font-[700] sm:text-2xl">
            {isEdit ? "Edit Banner" : "Add Banner"}
          </h5>
        </DialogTitle>
      </DialogHeader>

      <div className="w-full flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <BannerImageField
            label="Desktop banner"
            hint="Wide image for laptop & desktop"
            value={form.image}
            changing={isChangeDesktop}
            onChangeStart={() => setIsChangeDesktop(true)}
            onCancel={() => setIsChangeDesktop(false)}
            onUploaded={(url) => {
              updateField("image", url);
              setIsChangeDesktop(false);
            }}
          />
          <BannerImageField
            label="Mobile banner"
            hint="Optional — used on phones; falls back to desktop"
            value={form.mobileImage}
            changing={isChangeMobile}
            onChangeStart={() => setIsChangeMobile(true)}
            onCancel={() => setIsChangeMobile(false)}
            onUploaded={(url) => {
              updateField("mobileImage", url);
              setIsChangeMobile(false);
            }}
            onClear={() => {
              updateField("mobileImage", "");
              setIsChangeMobile(false);
            }}
          />
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-sm font-semibold">Banner type</Label>
            <Select
              value={form.type}
              onValueChange={(value: "top" | "bottom") => updateField("type", value)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Top carousel</SelectItem>
                <SelectItem value="bottom">Bottom offer banner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-semibold">Button label</Label>
            <Input
              type="text"
              placeholder="Shop now"
              value={form.ctaLabel}
              className="mt-1.5"
              onChange={(e) => updateField("ctaLabel", e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <Label className="text-sm font-semibold">Title</Label>
            <Input
              type="text"
              placeholder="Banner title"
              value={form.title}
              className="mt-1.5"
              onChange={(e) => updateField("title", e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <Label className="text-sm font-semibold">Subtitle</Label>
            <Input
              type="text"
              placeholder="Short supporting text"
              value={form.subtitle}
              className="mt-1.5"
              onChange={(e) => updateField("subtitle", e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <Label className="text-sm font-semibold">Link</Label>
            <Input
              type="text"
              placeholder="/shop"
              value={form.link}
              className="mt-1.5"
              onChange={(e) => updateField("link", e.target.value)}
            />
          </div>

          <Button
            className="sm:col-span-2 mt-1 w-full flex items-center justify-center gap-2"
            type="submit"
            disabled={isLoading}
          >
            {isEdit ? "Update banner" : "Create banner"}
            {isLoading ? <Loader className="size-4 animate-spin" /> : null}
          </Button>
        </form>
      </div>
    </CustomModal>
  );
};
