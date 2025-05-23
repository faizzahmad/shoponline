import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useAlertDialog } from "../../hooks/user-alert-dialog";
import { Category } from "./columns";
import { useCreateCategoryModal } from "../../hooks/use-create-category-modal";

interface ActionsDropdownProps {
    category: Category;
}

export function ActionsDropdown({ category }:ActionsDropdownProps) {
  const { setIsOpenAlert,setCategoryId } = useAlertDialog();
   const {setIsOpen} = useCreateCategoryModal();
  
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
        <DropdownMenuItem onClick={() => {
            setIsOpenAlert(true);
            setCategoryId(category._id);
        }}>Delete</DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          setIsOpen(true);
          setCategoryId(category._id);
        }}>Edit</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
