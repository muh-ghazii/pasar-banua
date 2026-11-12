import { Head, Link } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { ConfirmPostButton } from '@/components/admin/actions';
import { applyFilters, NativeSelect, SearchBox, StatusTabs } from '@/components/admin/filters';
import PageHeader from '@/components/dashboard/page-header';
import ResponsiveTable from '@/components/dashboard/responsive-table';
import EmptyState from '@/components/shared/empty-state';
import Pagination from '@/components/shared/pagination';
import { ActiveBadge, DemoBadge } from '@/components/shared/status-badge';
import { Badge } from '@/components/ui/badge';
import { formatDate, initials } from '@/lib/format';
import type { AdminUserRow, StatusCounts } from '@/types/admin';
import type { Paginated, Role } from '@/types/domain';

const PATH = '/admin/pengguna';

type Filters = { role: Role | null; q: string; status: 'aktif' | 'nonaktif' | null };

const roleVariant: Record<Role, 'neutral' | 'teal' | 'navy'> = {
    customer: 'neutral',
    seller: 'teal',
    admin: 'navy',
};

export default function AdminUsers({
    users,
    filters,
    counts,
}: {
    users: Paginated<AdminUserRow>;
    filters: Filters;
    counts: StatusCounts<Role>;
}) {
    const go = (next: Partial<Filters>) => applyFilters(PATH, { ...filters, ...next });

    return (
        <>
            <Head title="Pengguna" />
            <PageHeader
                eyebrow="Akun"
                title="Pengguna"
                description="Daftar pembeli, pelaku UMKM, dan admin. Akun yang dinonaktifkan langsung keluar dari sesi dan tidak dapat masuk."
            />

            <div className="mb-4">
                <StatusTabs
                    label="Filter peran"
                    value={filters.role}
                    onChange={(role) => go({ role: role as Role | null })}
                    items={[
                        { value: null, label: 'Semua', count: counts.all },
                        { value: 'customer', label: 'Pembeli', count: counts.customer },
                        { value: 'seller', label: 'Pelaku UMKM', count: counts.seller },
                        { value: 'admin', label: 'Admin', count: counts.admin },
                    ]}
                />
            </div>
            <div className="mb-5 grid gap-2 sm:flex sm:items-center">
                <SearchBox initial={filters.q} placeholder="Cari nama atau email" onSearch={(q) => go({ q })} />
                <NativeSelect
                    aria-label="Filter status akun"
                    value={filters.status ?? ''}
                    onChange={(e) => go({ status: (e.target.value || null) as Filters['status'] })}
                >
                    <option value="">Semua status</option>
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                </NativeSelect>
            </div>

            {users.data.length === 0 ? (
                <EmptyState icon={Users} title="Tidak ada pengguna yang cocok" description="Ubah kata kunci atau filter peran." />
            ) : (
                <ResponsiveTable
                    rows={users.data}
                    rowKey={(u) => u.id}
                    columns={[
                        {
                            key: 'user',
                            header: 'Pengguna',
                            primary: true,
                            cell: (u) => (
                                <div className="flex items-center gap-3">
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-cream">
                                        {initials(u.name)}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="flex items-center gap-1.5 font-semibold text-navy">
                                            <span className="truncate">{u.name}</span>
                                            {u.is_demo && <DemoBadge className="text-[0.6rem]" />}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            key: 'role',
                            header: 'Peran',
                            cell: (u) => (
                                <span className="inline-flex flex-col items-end gap-0.5 md:items-start">
                                    <Badge variant={roleVariant[u.role]}>{u.role_label}</Badge>
                                    {u.umkm && (
                                        <Link href={`/admin/umkm/${u.umkm.id}`} className="max-w-[12rem] truncate text-xs text-teal hover:underline">
                                            {u.umkm.name}
                                        </Link>
                                    )}
                                </span>
                            ),
                        },
                        { key: 'orders', header: 'Pesanan', align: 'right', cell: (u) => u.orders_count, hideOnMobile: true },
                        { key: 'joined', header: 'Bergabung', cell: (u) => formatDate(u.created_at) },
                        { key: 'status', header: 'Status', cell: (u) => <ActiveBadge active={u.is_active} /> },
                        {
                            key: 'actions',
                            header: '',
                            actions: true,
                            align: 'right',
                            cell: (u) =>
                                u.can_toggle ? (
                                    <ConfirmPostButton
                                        url={`/admin/pengguna/${u.id}/status`}
                                        variant={u.is_active ? 'outline' : 'default'}
                                        className={u.is_active ? 'text-brick' : undefined}
                                        destructive={u.is_active}
                                        title={u.is_active ? `Nonaktifkan akun ${u.name}?` : `Aktifkan akun ${u.name}?`}
                                        description={
                                            u.is_active
                                                ? 'Pengguna akan langsung keluar dan tidak dapat masuk sampai diaktifkan kembali. Data pesanan tetap tersimpan.'
                                                : 'Pengguna dapat masuk dan bertransaksi kembali.'
                                        }
                                        confirmLabel={u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                    >
                                        {u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                    </ConfirmPostButton>
                                ) : (
                                    <span className="text-xs text-muted-foreground">Tidak dapat diubah</span>
                                ),
                        },
                    ]}
                />
            )}

            <Pagination paginator={users} className="mt-6" />
        </>
    );
}
