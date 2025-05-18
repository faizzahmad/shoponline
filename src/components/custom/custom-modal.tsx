import { Dialog, DialogContent } from '@/components/ui/dialog';
interface ResponsiveModalProps {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}
export const CustomModal = ({ children, open, onOpenChange }: ResponsiveModalProps) => {
    return(
        <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className=''>
                    {children}
                </DialogContent>
            </Dialog>
    )
}