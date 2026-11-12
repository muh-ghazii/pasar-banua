import { Head, Link } from '@inertiajs/react';
import { ChevronRight, ClipboardList } from 'lucide-react';
import PageHeader from '@/components/dashboard/page-header';
import ResponsiveTable from '@/components/dashboard/responsive-table';
import FilterPills, { withQuery } from '@/components/seller/filter-pills';
import ListSearch from '@/components/seller/list-search';
import OrderStatusActions from '@/components/seller/order-status-actions';
import EmptyState from '@/components/shared/empty-state';
import Pagination from '@/components/shared/pagination';
import { DemoBadge, OrderStatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { formatDateTime, formatRupiah } from '@/lib/format';
import type { OrderData, OrderStatus, Paginated } from '@/types/domain';

type Props = {
    orders: Paginated<OrderData>;
    filters: { status: string; q: string };
    counts: Record<OrderStatus | 'all', number>;
};

const tabs: { value: '' | OrderStatus; label: string }[] = [
    { value: '', label: 'Semua' },
    { value: 'pending', label: 'Perlu konfirmasi' },
    { value: 'processing', label: 'Diproses' },
    { value: 'shipped', label: 'Dikirim' },
    { value: 'completed', label: 'Selesai' },
    { value: 'cancelled', label: 'Dibatalkan' },
];

export default function SellerOrders({ orders, filters, counts }: Props) {
    const isFiltered = filters.status !== '' || filters.q !== '';

    return (
        <>
            <Head title="Pesanan masuk" />
            <PageHeader
                eyebrow="Penjualan"
                title="Pesanan masuk"
                description="Konfirmasi pesanan baru secepatnya. Pembeli menerima notifikasi setiap kali status berubah."
            />

            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <FilterPills
                    label="Filter status pesanan"
                    items={tabs.map((t) => ({
                        label: t.label,
                        count: counts[t.value || 'all'],
                        active: filters.status === t.value,
                        href: withQuery('/seller/pesanan', { status: t.value, q: filters.q }),
                    }))}
                />
                <ListSearch
                    path="/seller/pesanan"
                    initial={filters.q}
                    params={{ status: filters.status }}
                    placeholder="Cari no. pesanan / penerima"
                />
            </div>

            {orders.data.length === 0 ? (
                <EmptyState
                    icon={ClipboardList}
                    title={isFiltered ? 'Tidak ada pesanan yang cocok' : 'Belum ada pesanan'}
                    description={
                        isFiltered
                            ? 'Coba ubah filter status atau kata kunci pencarian.'
                            : 'Pesanan dari pembeli akan muncul di sini. Pastikan produk Anda sudah disetujui dan stoknya tersedia.'
                    }
                    action={
                        isFiltered ? (
                            <Button asChild variant="outline">
                                <Link href="/seller/pesanan">Lihat semua pesanan</Link>
                            </Button>
                        ) : (
                            <Button asChild variant="outline">
                                <Link href="/seller/produk">Kelola produk</Link>
                            </Button>
                        )
                    }
                />
            ) : (
                <>
                    <ResponsiveTable
                        rows={orders.data}
                        rowKey={(o) => o.id}
                        columns={[
                            {
                                key: 'order',
                                header: 'Pesanan',
                                primary: true,
                                cell: (o) => (
                                    <div className="min-w-0">
                                        <Link
                                            href={`/seller/pesanan/${o.number}`}
                                            className="inline-flex items-center gap-1 font-heading font-bold text-navy hover:text-teal"
                                        >
                                            {o.number}
                                            <ChevronRight className="size-4 md:hidden" />
                                        </Link>
                                        <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(o.created_at)}</p>
                                        <p className="mt-1 line-clamp-1 text-[0.8125rem] text-navy/80">
                                            {o.items.map((i) => `${i.product_name} ×${i.quantity}`).join(', ')}
                                        </p>
                                        {o.is_demo && <DemoBadge className="mt-1.5 px-1.5 py-0 text-[0.6rem]" />}
                                    </div>
                                ),
                            },
                            {
                                key: 'buyer',
                                header: 'Penerima',
                                cell: (o) => (
                                    <div className="text-sm md:text-left">
                                        <p className="font-semibold text-navy">{o.recipient_name}</p>
                                        <p className="text-xs text-muted-foreground">{o.city ?? '-'}</p>
                                    </div>
                                ),
                            },
                            {
                                key: 'total',
                                header: 'Total',
                                align: 'right',
                                cell: (o) => <span className="font-semibold text-navy">{formatRupiah(o.total)}</span>,
                            },
                            {
                                key: 'status',
                                header: 'Status',
                                cell: (o) => <OrderStatusBadge status={o.status} />,
                            },
                            {
                                key: 'actions',
                                header: 'Aksi',
                                actions: true,
                                align: 'right',
                                cell: (o) => (
                                    <div className="flex flex-wrap items-center justify-end gap-2">
                                        <OrderStatusActions order={o} size="sm" className="justify-end" />
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={`/seller/pesanan/${o.number}`}>Detail</Link>
                                        </Button>
                                    </div>
                                ),
                            },
                        ]}
                    />
                    <Pagination paginator={orders} className="mt-6" />
                </>
            )}
        </>
    );
}
