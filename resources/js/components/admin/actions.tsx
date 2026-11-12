import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmDialog from '@/components/shared/confirm-dialog';
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
import { Textarea } from '@/components/ui/textarea';

/**
 * Dialog yang meminta alasan (tolak, nonaktifkan, batalkan). Alasan dikirim
 * ke backend sebagai `reason` dan divalidasi di sana.
 */
export function ReasonDialog({
    open,
    onOpenChange,
    url,
    title,
    description,
    confirmLabel,
    placeholder = 'Tuliskan alasan yang jelas agar mudah ditindaklanjuti.',
    suggestions = [],
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    url: string;
    title: string;
    description?: string;
    confirmLabel: string;
    placeholder?: string;
    suggestions?: string[];
}) {
    const form = useForm({ reason: '' });

    const close = (next: boolean) => {
        if (!next) {
            form.reset();
            form.clearErrors();
        }

        onOpenChange(next);
    };

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent>
                <form
                    className="grid gap-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post(url, {
                            preserveScroll: true,
                            onSuccess: () => close(false),
                        });
                    }}
                >
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
                    {suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {suggestions.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => form.setData('reason', s)}
                                    className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-navy hover:bg-accent"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="grid gap-1.5">
                        <label htmlFor="reason" className="text-[0.8125rem] font-semibold text-navy">
                            Alasan<span className="ml-0.5 text-brick">*</span>
                        </label>
                        <Textarea
                            id="reason"
                            value={form.data.reason}
                            onChange={(e) => form.setData('reason', e.target.value)}
                            placeholder={placeholder}
                            rows={4}
                            maxLength={500}
                            aria-invalid={!!form.errors.reason}
                        />
                        {form.errors.reason && (
                            <p role="alert" className="text-xs font-medium text-brick">
                                {form.errors.reason}
                            </p>
                        )}
                    </div>
                    <DialogFooter className="gap-2 sm:gap-2">
                        <Button type="button" variant="outline" onClick={() => close(false)} disabled={form.processing}>
                            Batal
                        </Button>
                        <Button type="submit" variant="destructive" disabled={form.processing}>
                            {form.processing && <Spinner />}
                            {confirmLabel}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

/** Tombol yang mengirim POST setelah konfirmasi. */
export function ConfirmPostButton({
    url,
    title,
    description,
    confirmLabel,
    children,
    variant = 'default',
    size = 'sm',
    destructive = false,
    method = 'post',
    className,
}: {
    url: string;
    title: string;
    description?: string;
    confirmLabel: string;
    children: React.ReactNode;
    variant?: React.ComponentProps<typeof Button>['variant'];
    size?: React.ComponentProps<typeof Button>['size'];
    destructive?: boolean;
    method?: 'post' | 'delete';
    className?: string;
}) {
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    return (
        <>
            <Button type="button" variant={variant} size={size} className={className} onClick={() => setOpen(true)}>
                {children}
            </Button>
            <ConfirmDialog
                open={open}
                onOpenChange={setOpen}
                title={title}
                description={description}
                confirmLabel={confirmLabel}
                destructive={destructive}
                processing={processing}
                onConfirm={() =>
                    router.visit(url, {
                        method,
                        preserveScroll: true,
                        onStart: () => setProcessing(true),
                        onFinish: () => {
                            setProcessing(false);
                            setOpen(false);
                        },
                    })
                }
            />
        </>
    );
}

/** Kirim POST langsung (untuk toggle ringan yang bisa dibalik). */
export function quickPost(url: string) {
    router.post(url, {}, { preserveScroll: true });
}
