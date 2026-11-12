import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';

/** Dialog konfirmasi untuk aksi yang tidak bisa dibatalkan (hapus, tolak, batalkan). */
export default function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Ya, lanjutkan',
    cancelLabel = 'Batal',
    destructive = false,
    processing = false,
    onConfirm,
    children,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    processing?: boolean;
    onConfirm: () => void;
    children?: React.ReactNode;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-heading text-lg font-bold text-navy">
                        {title}
                    </DialogTitle>
                    {description && (
                        <DialogDescription className="text-pretty">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>
                {children}
                <DialogFooter className="gap-2 sm:gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={processing}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={destructive ? 'destructive' : 'default'}
                        onClick={onConfirm}
                        disabled={processing}
                    >
                        {processing && <Spinner />}
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
