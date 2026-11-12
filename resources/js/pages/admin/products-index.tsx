import { Head, Link } from '@inertiajs/react';
import { BadgeCheck, Package } from 'lucide-react';
import { useState } from 'react';
import { quickPost, ReasonDialog } from '@/components/admin/actions';
import { FeaturedToggle, REJECT_SUGGESTIONS } from '@/components/admin/product-actions';
import { applyFilters, NativeSelect, SearchBox, StatusTabs } from '@/components/admin/filters';
import ProductImage from '@/components/brand/product-visual';
import PageHeader from '@/components/dashboard/page-header';
import ResponsiveTable from '@/components/dashboard/responsive-table';
import EmptyState from '@/components/shared/empty-state';
import Pagination from '@/components/shared/pagination';
import { ActiveBadge, DemoBadge, ProductStatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/format';
import type { AdminProductRow, Option, StatusCounts } from '@/types/admin';
import type { Paginated, ProductStatus } from '@/types/domain';

const PATH = '/admin/produk';

type Filters = {
    status: ProductStatus | null;
    q: string;
    kategori: string;
    umkm: number | null;
    unggulan: boolean;
};

export default function AdminProductsIndex({
    products,
    filters,
    counts,
    categories,
    umkms,
}: {
    products: Paginated<AdminProductRow>;
    filters: Filters;
    counts: StatusCounts<ProductStatus>;
    categories: Option[];
    umkms: Option[];
}) {
    const [rejecting, setRejecting] = useState<AdminProductRow | null>(null);
    const go = (next: Partial<Filters>) => applyFilters(PATH, { ...filters, ...next });

    return (
        <>
            <Head title="Kurasi Produk" />
            <PageHeader
                eyebrow="Kurasi"
                title="Kurasi Produk"
                description="Tinjau produk baru sebelum tayang, tandai produk unggulan, dan sembunyikan produk yang bermasalah."
            />

            <div className="mb-4">
                <StatusTabs
                    value={filters.status}
                    onChange={(status) => go({ status: status as ProductStatus | null })}
                    items={[
                        { value: null, label: 'Semua', count: counts.all },
                        { value: 'pending', label: 'Menunggu kurasi', count: counts.pending },
                        { value: 'approved', label: 'Disetujui', count: counts.approved },
                        { value: 'rejected', label: 'Ditolak', count: counts.rejected },
                    ]}
                />
            </div>

            <div className="mb-5 grid gap-2 sm:flex sm:flex-wrap sm:items-center">
                <SearchBox initial={filters.q} placeholder="Cari produk atau UMKM" onSearch={(q) => go({ q })} />
                <NativeSelect
                    aria-label="Filter kategori"
                    value={filters.kategori}
                    onChange={(e) => go({ kategori: e.target.value })}
                >
                    <option value="">Semua kategori</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.slug}>
                            {c.name}
                        </option>
                    ))}
                </NativeSelect>
                <NativeSelect
                    aria-label="Filter UMKM"
                    value={filters.umkm ?? ''}
                    onChange={(e) => go({ umkm: e.target.value ? Number(e.target.value) : null })}
                    className="sm:max-w-[14rem]"
                >
                    <option value="">Semua UMKM</option>
                    {umkms.map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.name}
                        </option>
                    ))}
                </NativeSelect>
                <label className="inline-flex h-10 items-center gap-2 rounded-lg border border-input bg-[#faf6f0] px-3 text-sm font-medium text-navy">
                    <input
                        type="checkbox"
                        checked={filters.unggulan}
                        onChange={(e) => go({ unggulan: e.target.checked })}
                        className="size-4 accent-[#076468]"
                    />
                    Hanya unggulan
                </label>
            </div>

            {products.data.length === 0 ? (
                <EmptyState icon={Package} title="Tidak ada produk yang cocok" description="Ubah filter atau kata kunci pencarian." />
            ) : (
                <ResponsiveTable
                    rows={products.data}
                    rowKey={(p) => p.id}
                    columns={[
                        {
                            key: 'product',
                            header: 'Produk',
                            primary: true,
                            cell: (p) => (
                                <Link href={`/admin/produk/${p.id}`} className="group flex items-center gap-3">
                                    <span className="size-12 shrink-0 overflow-hidden rounded-lg">
                                        <ProductImage src={p.image_url} name={p.name} categorySlug={p.category?.slug} icon={p.category?.icon} label={false} />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="flex items-center gap-1.5">
                                            <span className="truncate font-semibold text-navy group-hover:text-teal">{p.name}</span>
                                            {p.is_demo && <DemoBadge className="text-[0.6rem]" />}
                                        </span>
                                        <span className="block truncate text-xs text-muted-foreground">
                                            {p.umkm?.name ?? '-'} · {p.category?.name ?? 'Tanpa kategori'}
                                        </span>
                                    </span>
                                </Link>
                            ),
                        },
                        { key: 'price', header: 'Harga', align: 'right', cell: (p) => formatRupiah(p.price) },
                        { key: 'stock', header: 'Stok', align: 'right', cell: (p) => p.stock, hideOnMobile: true },
                        {
                            key: 'status',
                            header: 'Status',
                            cell: (p) => (
                                <span className="inline-flex flex-wrap justify-end gap-1 md:justify-start">
                                    <ProductStatusBadge status={p.status} />
                                    {!p.is_active && <ActiveBadge active={false} inactiveLabel="Disembunyikan" />}
                                </span>
                            ),
                        },
                        {
                            key: 'actions',
                            header: '',
                            actions: true,
                            align: 'right',
                            cell: (p) => (
                                <span className="inline-flex items-center justify-end gap-1">
                                    <FeaturedToggle product={p} />
                                    {p.status === 'pending' ? (
                                        <>
                                            <Button size="sm" variant="ghost" className="text-brick" onClick={() => setRejecting(p)}>
                                                Tolak
                                            </Button>
                                            <Button size="sm" onClick={() => quickPost(`/admin/produk/${p.id}/setujui`)}>
                                                <BadgeCheck />
                                                Setujui
                                            </Button>
                                        </>
                                    ) : (
                                        <Button asChild size="sm" variant="outline">
                                            <Link href={`/admin/produk/${p.id}`}>Tinjau</Link>
                                        </Button>
                                    )}
                                </span>
                            ),
                        },
                    ]}
                />
            )}

            <Pagination paginator={products} className="mt-6" />

            <ReasonDialog
                open={rejecting !== null}
                onOpenChange={(v) => !v && setRejecting(null)}
                url={rejecting ? `/admin/produk/${rejecting.id}/tolak` : ''}
                title={`Tolak "${rejecting?.name ?? ''}"?`}
                description="Catatan Anda dikirim ke penjual agar produk bisa diperbaiki dan diajukan ulang."
                confirmLabel="Tolak produk"
                suggestions={REJECT_SUGGESTIONS}
            />
        </>
    );
}
