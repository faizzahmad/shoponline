import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { Product } from "./columns";
import { useProductDialog } from "../hooks/use-product-alert";

interface ActionsDropdownProps {
   product : Product
}

export function ActionsDropdown({ product }:ActionsDropdownProps) {
  const { setIsOpenAlert,setProductId } = useProductDialog();
  
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
            setProductId(product._id);
        }}>
          <Trash/>
          Delete</DropdownMenuItem>
        {/* <DropdownMenuItem
        className="flex gap-2 items-center"
        onClick={() => {
          setIsOpen(true);
          setCategoryId(category._id);
        }}>
          <Edit/>
          Edit</DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
