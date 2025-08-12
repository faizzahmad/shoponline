import { Dialog, DialogContent } from '@/components/ui/dialog';
interface ResponsiveModalProps {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    className?: string;
}
export const CustomModal = ({ children, open, onOpenChange,className }: ResponsiveModalProps) => {
    return(
        <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className={className}>
                    {children}
                </DialogContent>
            </Dialog>
    )
}