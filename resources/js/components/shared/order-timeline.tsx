import { Check, X } from 'lucide-react';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { OrderData } from '@/types/domain';

/**
 * Linimasa status pesanan: Menunggu → Diproses → Dikirim → Selesai.
 * Pesanan yang dibatalkan ditampilkan dengan langkah terakhir merah.
 */
export default function OrderTimeline({
    order,
    className,
}: {
    order: Pick<
        OrderData,
        | 'status'
        | 'created_at'
        | 'processed_at'
        | 'shipped_at'
        | 'completed_at'
        | 'cancelled_at'
        | 'cancel_reason'
        | 'tracking_note'
    >;
    className?: string;
}) {
    const steps = [
        { key: 'pending', label: 'Pesanan dibuat', at: order.created_at },
        { key: 'processing', label: 'Diproses penjual', at: order.processed_at },
        { key: 'shipped', label: 'Dikirim', at: order.shipped_at, note: order.tracking_note },
        { key: 'completed', label: 'Selesai', at: order.completed_at },
    ];

    const cancelled = order.status === 'cancelled';
    const visible = cancelled ? steps.filter((s) => s.at) : steps;
    const all = cancelled
        ? [
              ...visible,
              {
                  key: 'cancelled',
                  label: 'Dibatalkan',
                  at: order.cancelled_at,
                  note: order.cancel_reason,
              },
          ]
        : visible;

    return (
        <ol className={cn('relative grid gap-5', className)}>
            {all.map((step, i) => {
                const done = !!step.at;
                const isCancel = step.key === 'cancelled';
                const last = i === all.length - 1;

                return (
                    <li key={step.key} className="relative flex gap-3.5">
                        {!last && (
                            <span
                                className={cn(
                                    'absolute top-7 bottom-[-1.25rem] left-[0.8125rem] w-0.5',
                                    done && all[i + 1]?.at ? 'bg-teal' : 'bg-border',
                                )}
                                aria-hidden="true"
                            />
                        )}
                        <span
                            className={cn(
                                'relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2',
                                isCancel
                                    ? 'border-brick bg-brick text-ivory'
                                    : done
                                      ? 'border-teal bg-teal text-ivory'
                                      : 'border-input bg-ivory text-transparent',
                            )}
                        >
                            {isCancel ? (
                                <X className="size-3.5" strokeWidth={3} />
                            ) : (
                                <Check className="size-3.5" strokeWidth={3} />
                            )}
                        </span>
                        <div className="min-w-0 pt-0.5">
                            <p
                                className={cn(
                                    'text-sm font-semibold',
                                    isCancel ? 'text-brick' : done ? 'text-navy' : 'text-muted-foreground',
                                )}
                            >
                                {step.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {done ? formatDateTime(step.at) : 'Belum'}
                            </p>
                            {'note' in step && step.note && (
                                <p className="mt-1 rounded-md bg-cream-200/70 px-2.5 py-1.5 text-xs text-navy-700">
                                    {step.note}
                                </p>
                            )}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}
