interface DeleteAlertProps {
  title : string;
  description : string;
  handelDelete : () => void;
}
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useProductDialog } from "../hooks/use-product-alert";

export const DeleteAlert =  ({title,description,handelDelete} :DeleteAlertProps ) => {
   const {isOpen,setIsOpenAlert,setProductId} = useProductDialog();
return (
        <AlertDialog open={isOpen} onOpenChange={() => {
          setIsOpenAlert(false);
          setProductId(''); // Clear the product ID when closing the dialog
        }} >
  <AlertDialogContent className="raleway">
    <AlertDialogHeader>
      <AlertDialogTitle className='exo'>{title}</AlertDialogTitle>
      <AlertDialogDescription>
        {description}
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handelDelete}>Confirm</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
    )
}