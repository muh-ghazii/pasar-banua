import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle, Boxes, Check, PackageX } from 'lucide-react';
import ProductImage from '@/components/brand/product-visual';
import PageHeader from '@/components/dashboard/page-header';
import ResponsiveTable from '@/components/dashboard/responsive-table';
import StatCard from '@/components/dashboard/stat-card';
import FilterPills, { withQuery } from '@/components/seller/filter-pills';
import ListSearch from '@/components/seller/list-search';
import EmptyState from '@/components/shared/empty-state';
import Pagination from '@/components/shared/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { formatNumber, formatRupiah } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types/domain';
import type { StockRow } from '@/types/seller';

type Props = {
    products: Paginated<StockRow>;
    summary: { total: number; units: number; low: number; empty: number };
    filters: { filter: 'semua' | 'menipis' | 'habis'; q: string };
    lowStock: number;
};

/** Input stok per baris; simpan hanya bila nilainya berubah. */
function StockEditor({ product }: { product: StockRow }) {
    const form = useForm({ stock: String(product.stock) });
    const changed = form.data.stock !== '' && Number(form.data.stock) !== product.stock;

    return (
        <form
            className="flex items-start justify-end gap-2"
            onSubmit={(e) => {
                e.preventDefault();

                if (changed) {
                    form.patch(`/seller/stok/${product.slug}`, { preserveScroll: true });
                }
            }}
        >
            <div>
                <div className="inline-flex items-center overflow-hidden rounded-lg border border-input bg-[#faf6f0]">
                    <button
                        type="button"
                        aria-label={`Kurangi stok ${product.name}`}
                        className="flex size-9 items-center justify-center text-navy hover:bg-accent disabled:opacity-40"
                        disabled={Number(form.data.stock) <= 0}
                        onClick={() => form.setData('stock', String(Math.max(0, Number(form.data.stock) - 1)))}
                    >
                        −
                    </button>
                    <input
                        inputMode="numeric"
                        aria-label={`Stok ${product.name}`}
                        value={form.data.stock}
                        onChange={(e) => form.setData('stock', e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-14 bg-transparent text-center text-sm font-semibold text-navy outline-none"
                    />
                    <button
                        type="button"
                        aria-label={`Tambah stok ${product.name}`}
                        className="flex size-9 items-center justify-center text-navy hover:bg-accent"
                        onClick={() => form.setData('stock', String(Number(form.data.stock || 0) + 1))}
                    >
                        +
                    </button>
                </div>
                {form.errors.stock && <p className="mt-1 text-xs font-medium text-brick">{form.errors.stock}</p>}
            </div>
            <Button
                type="submit"
                size="icon-sm"
                variant={changed ? 'default' : 'outline'}
                disabled={!changed || form.processing}
                aria-label={`Simpan stok ${product.name}`}
            >
                {form.processing ? <Spinner /> : <Check />}
            </Button>
        </form>
    );
}

export default function SellerStock({ products, summary, filters, lowStock }: Props) {
    return (
        <>
            <Head title="Stok produk" />
            <PageHeader
                eyebrow="Inventaris"
                title="Stok produk"
                description="Perbarui stok langsung dari daftar. Perubahan stok tidak memerlukan kurasi ulang dan langsung berlaku di katalog."
            />

            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                <StatCard label="Jumlah produk" value={formatNumber(summary.total)} icon={Boxes} tone="navy" />
                <StatCard label="Total unit tersedia" value={formatNumber(summary.units)} icon={Check} tone="teal" />
                <StatCard label={`Stok menipis (≤${lowStock})`} value={summary.low} icon={AlertTriangle} tone="gold" />
                <StatCard label="Stok habis" value={summary.empty} icon={PackageX} tone="brick" />
            </div>

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <FilterPills
                    label="Filter stok"
                    items={[
                        { label: 'Semua', value: 'semua', count: summary.total },
                        { label: 'Menipis', value: 'menipis', count: summary.low },
                        { label: 'Habis', value: 'habis', count: summary.empty },
                    ].map((f) => ({
                        label: f.label,
                        count: f.count,
                        active: filters.filter === f.value,
                        href: withQuery('/seller/stok', { filter: f.value === 'semua' ? '' : f.value, q: filters.q }),
                    }))}
                />
                <ListSearch
                    path="/seller/stok"
                    initial={filters.q}
                    params={{ filter: filters.filter === 'semua' ? '' : filters.filter }}
                    placeholder="Cari nama produk"
                />
            </div>

            {products.data.length === 0 ? (
                <EmptyState
                    icon={Boxes}
                    title={filters.filter !== 'semua' || filters.q ? 'Tidak ada produk pada filter ini' : 'Belum ada produk'}
                    description={
                        filters.filter === 'habis'
                            ? 'Bagus, semua produk masih memiliki stok.'
                            : filters.filter === 'menipis'
                              ? 'Tidak ada produk dengan stok menipis.'
                              : 'Tambahkan produk terlebih dahulu untuk mengelola stok.'
                    }
                    action={
                        <Button asChild variant="outline">
                            <Link href={filters.filter !== 'semua' || filters.q ? '/seller/stok' : '/seller/produk/tambah'}>
                                {filters.filter !== 'semua' || filters.q ? 'Lihat semua produk' : 'Tambah produk'}
                            </Link>
                        </Button>
                    }
                />
            ) : (
                <>
                    <ResponsiveTable
                        rows={products.data}
                        rowKey={(p) => `${p.id}-${p.stock}`}
                        columns={[
                            {
                                key: 'product',
                                header: 'Produk',
                                primary: true,
                                cell: (p) => (
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-cream-200">
                                            <ProductImage src={p.image_url} name={p.name} categorySlug={p.category?.slug} icon={p.category?.icon} label={false} />
                                        </div>
                                        <div className="min-w-0">
                                            <Link href={`/seller/produk/${p.slug}/ubah`} className="line-clamp-1 font-semibold text-navy hover:text-teal">
                                                {p.name}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">
                                                {formatRupiah(p.price)} · terjual {p.sold_count}
                                                {!p.is_active && ' · disembunyikan'}
                                            </p>
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                key: 'state',
                                header: 'Kondisi',
                                cell: (p) => (
                                    <Badge variant={p.stock === 0 ? 'brick' : p.stock <= lowStock ? 'gold' : 'teal'}>
                                        {p.stock === 0 ? 'Habis' : p.stock <= lowStock ? 'Menipis' : 'Aman'}
                                    </Badge>
                                ),
                            },
                            {
                                key: 'current',
                                header: 'Stok saat ini',
                                align: 'right',
                                hideOnMobile: true,
                                cell: (p) => (
                                    <span className={cn('font-heading text-base font-bold', p.stock === 0 ? 'text-brick' : 'text-navy')}>
                                        {p.stock}
                                    </span>
                                ),
                            },
                            {
                                key: 'edit',
                                header: 'Ubah stok',
                                actions: true,
                                align: 'right',
                                cell: (p) => <StockEditor product={p} />,
                            },
                        ]}
                    />
                    <Pagination paginator={products} className="mt-6" />
                </>
            )}
        </>
    );
}
