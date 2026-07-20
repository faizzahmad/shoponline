"use client";
import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";

export type BannerFormValues = {
  type: "top" | "bottom";
  image: string;
  mobileImage: string;
  link: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
};

export const emptyBannerForm = (): BannerFormValues => ({
  type: "top",
  image: "",
  mobileImage: "",
  link: "/shop",
  title: "",
  subtitle: "",
  ctaLabel: "Shop now",
});

export const useBannerAdmin = () => {
  const [editModal, setEditModal] = useQueryState(
    "bannerModal",
    parseAsBoolean.withDefault(false)
  );

  const [bannerId, setBannerId] = useQueryState(
    "banner-id",
    parseAsString.withDefault("").withOptions({ clearOnDefault: true })
  );

  const [deleteId, setDeleteId] = useQueryState(
    "banner-delete-id",
    parseAsString.withDefault("").withOptions({ clearOnDefault: true })
  );

  const openCreateModal = () => {
    setBannerId("");
    setEditModal(true);
  };

  const openEditModal = (id: string) => {
    setBannerId(id);
    setEditModal(true);
  };

  const closeEditModal = () => {
    setEditModal(false);
    setBannerId("");
  };

  const openDeleteAlert = (id: string) => setDeleteId(id);
  const closeDeleteAlert = () => setDeleteId("");

  return {
    editModal,
    bannerId,
    deleteId,
    openCreateModal,
    openEditModal,
    closeEditModal,
    openDeleteAlert,
    closeDeleteAlert,
    setEditModal,
  };
};
