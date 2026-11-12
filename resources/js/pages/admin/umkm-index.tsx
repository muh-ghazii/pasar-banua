import { Head, Link } from '@inertiajs/react';
import { Store } from 'lucide-react';
import { applyFilters, SearchBox, StatusTabs } from '@/components/admin/filters';
import PageHeader from '@/components/dashboard/page-header';
import ResponsiveTable from '@/components/dashboard/responsive-table';
import EmptyState from '@/components/shared/empty-state';
import Pagination from '@/components/shared/pagination';
import { DemoBadge, UmkmStatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { formatDate, initials } from '@/lib/format';
import type { AdminUmkmRow, StatusCounts } from '@/types/admin';
import type { Paginated, UmkmStatus } from '@/types/domain';

const PATH = '/admin/umkm';

export default function AdminUmkmIndex({
    umkms,
    filters,
    counts,
}: {
    umkms: Paginated<AdminUmkmRow>;
    filters: { status: UmkmStatus | null; q: string };
    counts: StatusCounts<UmkmStatus>;
}) {
    const go = (next: Partial<typeof filters>) => applyFilters(PATH, { ...filters, ...next });

    return (
        <>
            <Head title="Data UMKM" />
            <PageHeader
                eyebrow="Kemitraan"
                title="Data UMKM"
                description="Verifikasi pendaftaran, tinjau profil, dan pantau keaktifan pelaku UMKM yang bergabung."
            />

            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <StatusTabs
                    value={filters.status}
                    onChange={(status) => go({ status: status as UmkmStatus | null })}
                    items={[
                        { value: null, label: 'Semua', count: counts.all },
                        { value: 'pending', label: 'Menunggu verifikasi', count: counts.pending },
                        { value: 'approved', label: 'Terverifikasi', count: counts.approved },
                        { value: 'rejected', label: 'Ditolak', count: counts.rejected },
                        { value: 'suspended', label: 'Dinonaktifkan', count: counts.suspended },
                    ]}
                />
                <SearchBox
                    initial={filters.q}
                    placeholder="Cari nama UMKM, kota, pemilik"
                    onSearch={(q) => go({ q })}
                />
            </div>

            {umkms.data.length === 0 ? (
                <EmptyState
                    icon={Store}
                    title="Tidak ada UMKM yang cocok"
                    description="Coba ubah kata kunci atau pilih status lain."
                />
            ) : (
                <ResponsiveTable
                    rows={umkms.data}
                    rowKey={(u) => u.id}
                    columns={[
                        {
                            key: 'name',
                            header: 'UMKM',
                            primary: true,
                            cell: (u) => (
                                <Link href={`/admin/umkm/${u.id}`} className="group flex items-center gap-3">
                                    {u.logo_url ? (
                                        <img src={u.logo_url} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
                                    ) : (
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-navy text-xs font-bold text-cream">
                                            {initials(u.name)}
                                        </span>
                                    )}
                                    <span className="min-w-0">
                                        <span className="flex items-center gap-1.5 font-semibold text-navy group-hover:text-teal">
                                            <span className="truncate">{u.name}</span>
                                            {u.is_demo && <DemoBadge className="text-[0.6rem]" />}
                                        </span>
                                        <span className="block truncate text-xs text-muted-foreground">{u.city}</span>
                                    </span>
                                </Link>
                            ),
                        },
                        {
                            key: 'owner',
                            header: 'Pemilik',
                            cell: (u) =>
                                u.owner ? (
                                    <span className="block min-w-0">
                                        <span className="block truncate text-sm text-navy">{u.owner.name}</span>
                                        <span className="block truncate text-xs text-muted-foreground">{u.owner.email}</span>
                                    </span>
                                ) : (
                                    '-'
                                ),
                        },
                        { key: 'status', header: 'Status', cell: (u) => <UmkmStatusBadge status={u.status} /> },
                        { key: 'products', header: 'Produk', align: 'right', cell: (u) => u.products_count },
                        { key: 'orders', header: 'Pesanan', align: 'right', cell: (u) => u.orders_count, hideOnMobile: true },
                        { key: 'joined', header: 'Bergabung', cell: (u) => formatDate(u.created_at), hideOnMobile: true },
                        {
                            key: 'actions',
                            header: '',
                            actions: true,
                            align: 'right',
                            cell: (u) => (
                                <Button asChild size="sm" variant={u.status === 'pending' ? 'default' : 'outline'}>
                                    <Link href={`/admin/umkm/${u.id}`}>
                                        {u.status === 'pending' ? 'Tinjau' : 'Detail'}
                                    </Link>
                                </Button>
                            ),
                        },
                    ]}
                />
            )}

            <Pagination paginator={umkms} className="mt-6" />
        </>
    );
}
