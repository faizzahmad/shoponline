import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { useAlertDialog } from "../../hooks/user-alert-dialog";
import { SubCategory } from "./columns";
import { useCreateCategoryModal } from "../../hooks/use-create-category-modal";
import { useCreateSubCategoryModal } from "../../hooks/use-subcategory-modal";

interface SubCatActionsDropdownProps {
    subcategory: SubCategory;
}

export function SubCatActionsDropdown({ subcategory }:SubCatActionsDropdownProps) {
  const { setIsOpenAlert,setSubCategoryId } = useAlertDialog();
   const { setIsOpen } = useCreateSubCategoryModal();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
        className="flex gap-2 items-center"
        onClick={() => {
            setIsOpenAlert(true);
            setSubCategoryId(subcategory._id);
        }}>
          <Trash/>
          Delete
          </DropdownMenuItem>
        <DropdownMenuItem 
        className="flex gap-2 items-center"
        onClick={() => {
          setIsOpen(true);
          setSubCategoryId(subcategory._id)
        }}
        >
          <Edit/>
          Edit</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
