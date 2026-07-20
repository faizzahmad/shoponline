"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBannerAdmin } from "../hooks/user-banner";
import { deleteData } from "@/utils/apiCall";
import { toast } from "sonner";
import { useState } from "react";

type BannerDeleteAlertProps = {
  onDeleted: () => void;
};

export const BannerDeleteAlert = ({ onDeleted }: BannerDeleteAlertProps) => {
  const { deleteId, closeDeleteAlert } = useBannerAdmin();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      const response = await deleteData<{ message: string }>(`banner?id=${deleteId}`);
      if (response?.message) {
        toast.success(response.message);
        onDeleted();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete banner");
    } finally {
      setLoading(false);
      closeDeleteAlert();
    }
  };

  return (
    <AlertDialog
      open={Boolean(deleteId)}
      onOpenChange={(open) => {
        if (!open) closeDeleteAlert();
      }}
    >
      <AlertDialogContent className="raleway">
        <AlertDialogHeader>
          <AlertDialogTitle className="exo">Delete banner?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove the banner from the storefront. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
