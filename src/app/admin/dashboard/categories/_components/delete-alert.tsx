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
import { useAlertDialog } from "../hooks/user-alert-dialog";

export const DeleteAlert =  ({title,description,handelDelete} :DeleteAlertProps ) => {
   const {isOpen,setIsOpen,setCategoryId} = useAlertDialog();
return (
        <AlertDialog open={isOpen} onOpenChange={() => {
          setIsOpen(false);
          setCategoryId('');
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