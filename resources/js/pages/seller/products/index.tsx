import { Head, Link, router } from '@inertiajs/react';
import { Eye, Package, PackagePlus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ProductImage from '@/components/brand/product-visual';
import PageHeader from '@/components/dashboard/page-header';
import ResponsiveTable from '@/components/dashboard/responsive-table';
import FilterPills, { withQuery } from '@/components/seller/filter-pills';
import ListSearch from '@/components/seller/list-search';
import ConfirmDialog from '@/components/shared/confirm-dialog';
import EmptyState from '@/components/shared/empty-state';
import Pagination from '@/components/shared/pagination';
import { DemoBadge, ProductStatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatRupiah } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Paginated, ProductStatus } from '@/types/domain';
import type { SellerCategoryOption, SellerProductRow } from '@/types/seller';

type Props = {
    products: Paginated<SellerProductRow>;
    filters: { q: string; status: string; kategori: string };
    counts: Record<ProductStatus | 'all', number>;
    categories: SellerCategoryOption[];
    canCreate: boolean;
};

const statusFilters: { value: '' | ProductStatus; label: string }[] = [
    { value: '', label: 'Semua' },
    { value: 'approved', label: 'Disetujui' },
    { value: 'pending', label: 'Menunggu kurasi' },
    { value: 'rejected', label: 'Ditolak' },
];

export default function SellerProducts({ products, filters, counts, categories, canCreate }: Props) {
    const [deleting, setDeleting] = useState<SellerProductRow | null>(null);
    const [processing, setProcessing] = useState(false);

    const toggle = (p: SellerProductRow) =>
        router.patch(`/seller/produk/${p.slug}/aktif`, {}, { preserveScroll: true });

    const destroy = () => {
        if (!deleting) {
            return;
        }

        router.delete(`/seller/produk/${deleting.slug}`, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => {
                setProcessing(false);
                setDeleting(null);
            },
        });
    };

    const isFiltered = filters.q !== '' || filters.status !== '' || filters.kategori !== '';

    return (
        <>
            <Head title="Kelola produk" />
            <PageHeader
                eyebrow="Katalog"
                title="Kelola produk"
                description="Tambah, ubah, dan atur tampilan produk Anda. Produk baru dan perubahan penting ditinjau admin sebelum tayang."
                actions={
                    canCreate && (
                        <Button asChild>
                            <Link href="/seller/produk/tambah">
                                <PackagePlus />
                                Tambah produk
                            </Link>
                        </Button>
                    )
                }
            />

            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <FilterPills
                    label="Filter status kurasi"
                    items={statusFilters.map((s) => ({
                        label: s.label,
                        count: counts[s.value || 'all'],
                        active: filters.status === s.value,
                        href: withQuery('/seller/produk', { status: s.value, q: filters.q, kategori: filters.kategori }),
                    }))}
                />
                <div className="flex flex-col gap-2 sm:flex-row">
                    <select
                        aria-label="Filter kategori"
                        value={filters.kategori}
                        onChange={(e) =>
                            router.get(
                                withQuery('/seller/produk', { status: filters.status, q: filters.q, kategori: e.target.value }),
                                {},
                                { preserveState: true, preserveScroll: true },
                            )
                        }
                        className="h-10 rounded-lg border border-input bg-[#faf6f0] px-3 text-sm text-navy outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20"
                    >
                        <option value="">Semua kategori</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.slug}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <ListSearch
                        path="/seller/produk"
                        initial={filters.q}
                        params={{ status: filters.status, kategori: filters.kategori }}
                        placeholder="Cari nama produk"
                    />
                </div>
            </div>

            {products.data.length === 0 ? (
                <EmptyState
                    icon={Package}
                    title={isFiltered ? 'Tidak ada produk yang cocok' : 'Belum ada produk'}
                    description={
                        isFiltered
                            ? 'Coba ubah kata kunci atau filter yang dipilih.'
                            : 'Mulai dengan produk andalan Anda. Siapkan 2–3 foto asli, harga, dan stok.'
                    }
                    action={
                        isFiltered ? (
                            <Button asChild variant="outline">
                                <Link href="/seller/produk">Reset filter</Link>
                            </Button>
                        ) : (
                            canCreate && (
                                <Button asChild>
                                    <Link href="/seller/produk/tambah">
                                        <PackagePlus />
                                        Tambah produk pertama
                                    </Link>
                                </Button>
                            )
                        )
                    }
                />
            ) : (
                <>
                    <ResponsiveTable
                        rows={products.data}
                        rowKey={(p) => p.id}
                        columns={[
                            {
                                key: 'product',
                                header: 'Produk',
                                primary: true,
                                cell: (p) => (
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-cream-200">
                                            <ProductImage
                                                src={p.image_url}
                                                name={p.name}
                                                categorySlug={p.category?.slug}
                                                icon={p.category?.icon}
                                                label={false}
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <Link
                                                href={`/seller/produk/${p.slug}/ubah`}
                                                className="line-clamp-2 font-semibold text-navy hover:text-teal"
                                            >
                                                {p.name}
                                            </Link>
                                            <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                                {p.category?.name ?? 'Tanpa kategori'}
                                                {p.is_featured && <span className="font-semibold text-gold-700">· Unggulan</span>}
                                                {p.is_demo && <DemoBadge className="px-1.5 py-0 text-[0.6rem]" />}
                                            </p>
                                            {p.status === 'rejected' && p.rejection_reason && (
                                                <p className="mt-1 line-clamp-2 text-xs text-brick">Catatan admin: {p.rejection_reason}</p>
                                            )}
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                key: 'price',
                                header: 'Harga',
                                align: 'right',
                                cell: (p) => <span className="font-semibold text-navy">{formatRupiah(p.price)}</span>,
                            },
                            {
                                key: 'stock',
                                header: 'Stok',
                                align: 'right',
                                cell: (p) => (
                                    <span
                                        className={cn(
                                            'font-semibold',
                                            p.stock === 0 ? 'text-brick' : p.stock <= 5 ? 'text-gold-700' : 'text-navy',
                                        )}
                                    >
                                        {p.stock === 0 ? 'Habis' : p.stock}
                                    </span>
                                ),
                            },
                            {
                                key: 'sold',
                                header: 'Terjual',
                                align: 'right',
                                hideOnMobile: true,
                                cell: (p) => <span className="text-muted-foreground">{p.sold_count}</span>,
                            },
                            {
                                key: 'status',
                                header: 'Kurasi',
                                cell: (p) => <ProductStatusBadge status={p.status} />,
                            },
                            {
                                key: 'active',
                                header: 'Tampil',
                                cell: (p) => (
                                    <Switch
                                        checked={p.is_active}
                                        onCheckedChange={() => toggle(p)}
                                        aria-label={p.is_active ? `Sembunyikan ${p.name}` : `Tampilkan ${p.name}`}
                                    />
                                ),
                            },
                            {
                                key: 'actions',
                                header: 'Aksi',
                                actions: true,
                                align: 'right',
                                cell: (p) => (
                                    <div className="flex justify-end gap-1">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button asChild variant="ghost" size="icon-sm" aria-label={`Pratinjau ${p.name}`}>
                                                    <Link href={`/produk/${p.slug}`}>
                                                        <Eye />
                                                    </Link>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Pratinjau</TooltipContent>
                                        </Tooltip>
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/seller/produk/${p.slug}/ubah`}>
                                                <Pencil />
                                                Ubah
                                            </Link>
                                        </Button>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    className="text-brick hover:bg-brick-100 hover:text-brick"
                                                    aria-label={`Hapus ${p.name}`}
                                                    onClick={() => setDeleting(p)}
                                                >
                                                    <Trash2 />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Hapus</TooltipContent>
                                        </Tooltip>
                                    </div>
                                ),
                            },
                        ]}
                    />
                    <Pagination paginator={products} className="mt-6" />
                </>
            )}

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Hapus produk ini?"
                description={
                    deleting
                        ? `"${deleting.name}" akan dihapus dari katalog dan keranjang pembeli. Riwayat pesanan yang sudah ada tetap tersimpan.`
                        : undefined
                }
                confirmLabel="Hapus produk"
                destructive
                processing={processing}
                onConfirm={destroy}
            />
        </>
    );
}
