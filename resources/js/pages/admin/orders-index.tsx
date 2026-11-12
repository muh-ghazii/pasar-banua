import { Head, Link } from '@inertiajs/react';
import { ClipboardList } from 'lucide-react';
import { applyFilters, NativeSelect, SearchBox, StatusTabs } from '@/components/admin/filters';
import PageHeader from '@/components/dashboard/page-header';
import ResponsiveTable from '@/components/dashboard/responsive-table';
import EmptyState from '@/components/shared/empty-state';
import Pagination from '@/components/shared/pagination';
import { DemoBadge, OrderStatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { formatDateTime, formatRupiah } from '@/lib/format';
import type { AdminOrderRow, Option, StatusCounts } from '@/types/admin';
import type { OrderStatus, Paginated } from '@/types/domain';

const PATH = '/admin/pesanan';

type Filters = { status: OrderStatus | null; q: string; umkm: number | null };

export default function AdminOrdersIndex({
    orders,
    filters,
    counts,
    umkms,
}: {
    orders: Paginated<AdminOrderRow>;
    filters: Filters;
    counts: StatusCounts<OrderStatus>;
    umkms: Option[];
}) {
    const go = (next: Partial<Filters>) => applyFilters(PATH, { ...filters, ...next });

    return (
        <>
            <Head title="Manajemen Pesanan" />
            <PageHeader
                eyebrow="Transaksi"
                title="Manajemen Pesanan"
                description="Pantau seluruh pesanan lintas UMKM. Status diperbarui oleh penjual; admin dapat membatalkan pesanan bermasalah."
            />

            <div className="mb-4">
                <StatusTabs
                    value={filters.status}
                    onChange={(status) => go({ status: status as OrderStatus | null })}
                    items={[
                        { value: null, label: 'Semua', count: counts.all },
                        { value: 'pending', label: 'Menunggu konfirmasi', count: counts.pending },
                        { value: 'processing', label: 'Diproses', count: counts.processing },
                        { value: 'shipped', label: 'Dikirim', count: counts.shipped },
                        { value: 'completed', label: 'Selesai', count: counts.completed },
                        { value: 'cancelled', label: 'Dibatalkan', count: counts.cancelled },
                    ]}
                />
            </div>
            <div className="mb-5 grid gap-2 sm:flex sm:items-center">
                <SearchBox initial={filters.q} placeholder="No. pesanan, nama, atau email pembeli" onSearch={(q) => go({ q })} />
                <NativeSelect
                    aria-label="Filter UMKM"
                    value={filters.umkm ?? ''}
                    onChange={(e) => go({ umkm: e.target.value ? Number(e.target.value) : null })}
                    className="sm:max-w-[16rem]"
                >
                    <option value="">Semua UMKM</option>
                    {umkms.map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.name}
                        </option>
                    ))}
                </NativeSelect>
            </div>

            {orders.data.length === 0 ? (
                <EmptyState icon={ClipboardList} title="Tidak ada pesanan" description="Belum ada pesanan yang cocok dengan filter ini." />
            ) : (
                <ResponsiveTable
                    rows={orders.data}
                    rowKey={(o) => o.id}
                    columns={[
                        {
                            key: 'number',
                            header: 'Pesanan',
                            primary: true,
                            cell: (o) => (
                                <Link href={`/admin/pesanan/${o.number}`} className="group block">
                                    <span className="flex items-center gap-1.5 font-semibold text-navy group-hover:text-teal">
                                        {o.number}
                                        {o.is_demo && <DemoBadge className="text-[0.6rem]" />}
                                    </span>
                                    <span className="block text-xs text-muted-foreground">{formatDateTime(o.created_at)}</span>
                                </Link>
                            ),
                        },
                        {
                            key: 'buyer',
                            header: 'Pembeli',
                            cell: (o) => (
                                <span className="block min-w-0">
                                    <span className="block truncate text-sm text-navy">{o.buyer?.name ?? '-'}</span>
                                    <span className="hidden truncate text-xs text-muted-foreground md:block">{o.buyer?.email}</span>
                                </span>
                            ),
                        },
                        { key: 'umkm', header: 'UMKM', cell: (o) => o.umkm?.name ?? '-' },
                        { key: 'items', header: 'Item', align: 'right', cell: (o) => o.items_count, hideOnMobile: true },
                        { key: 'status', header: 'Status', cell: (o) => <OrderStatusBadge status={o.status} /> },
                        {
                            key: 'total',
                            header: 'Total',
                            align: 'right',
                            cell: (o) => <span className="font-semibold text-navy">{formatRupiah(o.total)}</span>,
                        },
                        {
                            key: 'actions',
                            header: '',
                            actions: true,
                            align: 'right',
                            cell: (o) => (
                                <Button asChild size="sm" variant="outline">
                                    <Link href={`/admin/pesanan/${o.number}`}>Detail</Link>
                                </Button>
                            ),
                        },
                    ]}
                />
            )}

            <Pagination paginator={orders} className="mt-6" />
        </>
    );
}
