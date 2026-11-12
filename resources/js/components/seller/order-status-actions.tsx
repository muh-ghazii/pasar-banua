import { useForm } from '@inertiajs/react';
import { CheckCircle2, PackageCheck, Truck, XCircle } from 'lucide-react';
import { useState } from 'react';
import FormField from '@/components/shared/form-field';
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
import { cn } from '@/lib/utils';
import type { OrderData, OrderStatus } from '@/types/domain';

const copy: Record<
    OrderStatus,
    { button: string; title: string; description: string; icon: typeof Truck; noteLabel?: string; notePlaceholder?: string }
> = {
    processing: {
        button: 'Terima & proses',
        title: 'Terima pesanan ini?',
        description: 'Pembeli akan diberi tahu bahwa pesanan sedang Anda siapkan. Setelah diproses, pembeli tidak dapat membatalkan sendiri.',
        icon: PackageCheck,
    },
    shipped: {
        button: 'Tandai dikirim',
        title: 'Tandai pesanan sudah dikirim',
        description: 'Tambahkan catatan pengiriman agar pembeli mudah melacak paket. Pengiriman pada mode demo tidak terhubung ke ekspedisi.',
        icon: Truck,
        noteLabel: 'Catatan pengiriman',
        notePlaceholder: 'Contoh: Dikirim lewat kurir lokal, estimasi tiba besok sore.',
    },
    completed: {
        button: 'Tandai selesai',
        title: 'Tandai pesanan selesai?',
        description: 'Gunakan bila pembeli sudah menerima pesanan namun belum mengonfirmasi.',
        icon: CheckCircle2,
    },
    cancelled: {
        button: 'Batalkan',
        title: 'Batalkan pesanan ini?',
        description: 'Stok produk akan dikembalikan otomatis dan pembeli menerima notifikasi beserta alasan pembatalan.',
        icon: XCircle,
        noteLabel: 'Alasan pembatalan',
        notePlaceholder: 'Contoh: Bahan baku sedang kosong hingga minggu depan.',
    },
    pending: {
        button: '',
        title: '',
        description: '',
        icon: CheckCircle2,
    },
};

/** Tombol perubahan status pesanan sesuai alur yang diizinkan backend. */
export default function OrderStatusActions({
    order,
    size = 'default',
    className,
}: {
    order: OrderData;
    size?: 'default' | 'sm';
    className?: string;
}) {
    const [target, setTarget] = useState<OrderStatus | null>(null);
    const form = useForm<{ status: string; note: string }>({ status: '', note: '' });

    if (!order.can?.update_status || !order.next_statuses?.length) {
        return null;
    }

    const open = (status: OrderStatus) => {
        form.clearErrors();
        form.setData({ status, note: '' });
        setTarget(status);
    };

    const submit = () => {
        form.post(`/seller/pesanan/${order.number}/status`, {
            preserveScroll: true,
            onSuccess: () => setTarget(null),
        });
    };

    const current = target ? copy[target] : null;

    return (
        <>
            <div className={cn('flex flex-wrap gap-2', className)}>
                {order.next_statuses.map((s) => {
                    const item = copy[s.value];
                    const destructive = s.value === 'cancelled';

                    return (
                        <Button
                            key={s.value}
                            type="button"
                            size={size}
                            variant={destructive ? 'outline' : 'default'}
                            className={cn(destructive && 'border-brick/30 text-brick hover:bg-brick-100 hover:text-brick')}
                            onClick={() => open(s.value)}
                        >
                            <item.icon />
                            {item.button}
                        </Button>
                    );
                })}
            </div>

            <Dialog open={target !== null} onOpenChange={(v) => !v && setTarget(null)}>
                <DialogContent>
                    {current && target && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="font-heading text-lg font-bold text-navy">{current.title}</DialogTitle>
                                <DialogDescription className="text-pretty">
                                    Pesanan {order.number}. {current.description}
                                </DialogDescription>
                            </DialogHeader>
                            {current.noteLabel && (
                                <FormField
                                    label={current.noteLabel}
                                    htmlFor="status-note"
                                    error={form.errors.note}
                                    required={target === 'cancelled'}
                                >
                                    <Textarea
                                        id="status-note"
                                        rows={3}
                                        maxLength={255}
                                        value={form.data.note}
                                        onChange={(e) => form.setData('note', e.target.value)}
                                        placeholder={current.notePlaceholder}
                                        aria-invalid={!!form.errors.note}
                                    />
                                </FormField>
                            )}
                            {form.errors.status && (
                                <p role="alert" className="text-sm font-medium text-brick">
                                    {form.errors.status}
                                </p>
                            )}
                            <DialogFooter className="gap-2 sm:gap-2">
                                <Button variant="outline" onClick={() => setTarget(null)} disabled={form.processing}>
                                    Kembali
                                </Button>
                                <Button
                                    variant={target === 'cancelled' ? 'destructive' : 'default'}
                                    onClick={submit}
                                    disabled={form.processing}
                                >
                                    {form.processing && <Spinner />}
                                    {target === 'cancelled' ? 'Ya, batalkan pesanan' : current.button}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
