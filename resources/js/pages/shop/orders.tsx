import { Head, Link } from '@inertiajs/react';
import { ChevronRight, Receipt, Store } from 'lucide-react';
import ProductImage from '@/components/brand/product-visual';
import EmptyState from '@/components/shared/empty-state';
import Pagination from '@/components/shared/pagination';
import { DemoBadge, OrderStatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatRupiah } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { OrderData, OrderStatus, Paginated } from '@/types/domain';

type Props = {
    orders: Paginated<OrderData>;
    status: OrderStatus | null;
    counts: Record<OrderStatus | 'all', number>;
};

const tabs: { value: OrderStatus | null; label: string }[] = [
    { value: null, label: 'Semua' },
    { value: 'pending', label: 'Menunggu konfirmasi' },
    { value: 'processing', label: 'Diproses' },
    { value: 'shipped', label: 'Dikirim' },
    { value: 'completed', label: 'Selesai' },
    { value: 'cancelled', label: 'Dibatalkan' },
];

export default function Orders({ orders, status, counts }: Props) {
    return (
        <>
            <Head title="Pesanan saya" />
            <div className="container-page py-8 lg:py-12">
                <p className="eyebrow mb-2 text-teal">Akun</p>
                <h1 className="font-heading text-3xl font-extrabold text-navy sm:text-4xl">Pesanan saya</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                    Riwayat dan status pesanan Anda di Pasar Banua.
                </p>

                <nav
                    aria-label="Filter status pesanan"
                    className="no-scrollbar -mx-4 mt-7 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
                >
                    {tabs.map((t) => {
                        const active = status === t.value;
                        const count = counts[t.value ?? 'all'] ?? 0;

                        return (
                            <Link
                                key={t.label}
                                href={t.value ? `/akun/pesanan?status=${t.value}` : '/akun/pesanan'}
                                preserveScroll
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                    'inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors',
                                    active
                                        ? 'border-navy bg-navy text-cream'
                                        : 'border-border bg-ivory text-navy hover:border-navy/40',
                                )}
                            >
                                {t.label}
                                <span className={cn('text-xs', active ? 'text-cream/70' : 'text-muted-foreground')}>
                                    {count}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-6">
                    {orders.data.length === 0 ? (
                        <EmptyState
                            icon={Receipt}
                            title={status ? 'Tidak ada pesanan dengan status ini' : 'Belum ada pesanan'}
                            description="Pesanan yang Anda buat akan muncul di sini beserta statusnya."
                            action={
                                <Button asChild>
                                    <Link href="/produk">Mulai belanja</Link>
                                </Button>
                            }
                        />
                    ) : (
                        <ul className="grid gap-4">
                            {orders.data.map((o) => (
                                <OrderCard key={o.id} order={o} />
                            ))}
                        </ul>
                    )}
                    <Pagination paginator={orders} className="mt-8" />
                </div>
            </div>
        </>
    );
}

function OrderCard({ order }: { order: OrderData }) {
    const first = order.items[0];
    const more = order.items.length - 1;

    return (
        <li>
            <Link
                href={`/akun/pesanan/${order.number}`}
                className="group block overflow-hidden rounded-2xl border border-border/80 bg-card transition-shadow hover:shadow-lift"
            >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 bg-cream-200/40 px-4 py-3 sm:px-5">
                    <p className="flex min-w-0 items-center gap-2 text-sm font-bold text-navy">
                        <Store className="size-4 shrink-0 text-teal" />
                        <span className="truncate">{order.umkm?.name}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        {order.is_demo && <DemoBadge />}
                        <OrderStatusBadge status={order.status} />
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 sm:p-5">
                    {first && (
                        <span className="size-16 shrink-0 overflow-hidden rounded-xl bg-cream-200">
                            <ProductImage src={first.image_url} name={first.product_name} label={false} />
                        </span>
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 font-heading text-[0.95rem] font-bold text-navy">
                            {first?.product_name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {first?.quantity} × {formatRupiah(first?.unit_price)}
                            {more > 0 && ` · +${more} produk lain`}
                        </p>
                        <p className="mt-1.5 text-xs text-muted-foreground">
                            {order.number} · {formatDate(order.created_at)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="font-heading font-extrabold text-navy">{formatRupiah(order.total)}</p>
                    </div>
                    <ChevronRight className="hidden size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 sm:block" />
                </div>
            </Link>
        </li>
    );
}
