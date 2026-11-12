import { Head, router } from '@inertiajs/react';
import { SearchX, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import Pagination from '@/components/shared/pagination';
import EmptyState from '@/components/shared/empty-state';
import CatalogFilterPanel, {
    type FilterOptions,
} from '@/components/shop/catalog-filters';
import { ProductGrid } from '@/components/shop/product-card';
import SearchForm from '@/components/shop/search-form';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { formatRupiah } from '@/lib/format';
import type { Paginated, ProductCardData } from '@/types/domain';
import type { CatalogFilters } from '@/types/shop';

type Props = FilterOptions & {
    products: Paginated<ProductCardData>;
    filters: CatalogFilters;
};

const sorts: { value: CatalogFilters['urut']; label: string }[] = [
    { value: 'terbaru', label: 'Terbaru' },
    { value: 'populer', label: 'Paling laris' },
    { value: 'termurah', label: 'Harga termurah' },
    { value: 'termahal', label: 'Harga tertinggi' },
    { value: 'rating', label: 'Rating tertinggi' },
];

function toQuery(f: CatalogFilters): Record<string, string | number> {
    const q: Record<string, string | number> = {};

    if (f.q) q.q = f.q;
    if (f.kategori) q.kategori = f.kategori;
    if (f.kota) q.kota = f.kota;
    if (f.harga_min !== null) q.harga_min = f.harga_min;
    if (f.harga_maks !== null) q.harga_maks = f.harga_maks;
    if (f.tersedia) q.tersedia = 1;
    if (f.urut !== 'terbaru') q.urut = f.urut;

    return q;
}

export default function Catalog({
    products,
    filters,
    categories,
    cities,
    priceRange,
}: Props) {
    const [sheetOpen, setSheetOpen] = useState(false);

    const apply = (patch: Partial<CatalogFilters>) => {
        router.get('/produk', toQuery({ ...filters, ...patch }), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const category = categories.find((c) => c.slug === filters.kategori);
    const title = filters.q
        ? `Hasil untuk “${filters.q}”`
        : (category?.name ?? 'Semua produk');

    const chips: { label: string; clear: Partial<CatalogFilters> }[] = [];
    if (filters.q) chips.push({ label: `Kata kunci: ${filters.q}`, clear: { q: '' } });
    if (category) chips.push({ label: category.name, clear: { kategori: '' } });
    if (filters.kota) chips.push({ label: filters.kota, clear: { kota: '' } });
    if (filters.harga_min !== null || filters.harga_maks !== null) {
        chips.push({
            label: `${filters.harga_min !== null ? formatRupiah(filters.harga_min) : 'Rp0'} – ${filters.harga_maks !== null ? formatRupiah(filters.harga_maks) : 'tanpa batas'}`,
            clear: { harga_min: null, harga_maks: null },
        });
    }
    if (filters.tersedia) chips.push({ label: 'Tersedia', clear: { tersedia: false } });

    const activeFilterCount = chips.filter((c) => !('q' in c.clear)).length;
    const options = { categories, cities, priceRange };

    return (
        <>
            <Head title={title} />

            <div className="border-b border-border bg-ivory/60">
                <div className="container-page py-8 lg:py-10">
                    <p className="eyebrow mb-2 text-teal">Jelajahi produk</p>
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h1 className="font-heading text-3xl font-extrabold text-balance text-navy sm:text-4xl">
                                {title}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {products.total} produk dari UMKM terverifikasi
                                di Kalimantan Selatan
                            </p>
                        </div>
                        <SearchForm
                            key={filters.q}
                            initial={filters.q}
                            className="w-full lg:max-w-sm"
                            placeholder="Cari di katalog…"
                            id="catalog-search"
                        />
                    </div>
                </div>
            </div>

            <div className="container-page grid gap-8 py-8 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-10 lg:py-10">
                <aside className="hidden lg:block" aria-label="Filter produk">
                    <div className="sticky top-24">
                        <CatalogFilterPanel
                            key={`${filters.harga_min}-${filters.harga_maks}`}
                            filters={filters}
                            options={options}
                            onApply={apply}
                        />
                    </div>
                </aside>

                <div className="min-w-0">
                    <div className="mb-6 flex items-center justify-between gap-3">
                        <Button
                            variant="outline"
                            className="lg:hidden"
                            onClick={() => setSheetOpen(true)}
                        >
                            <SlidersHorizontal />
                            Filter
                            {activeFilterCount > 0 && (
                                <span className="flex size-5 items-center justify-center rounded-full bg-teal text-[0.65rem] font-bold text-ivory">
                                    {activeFilterCount}
                                </span>
                            )}
                        </Button>
                        <p className="hidden text-sm text-muted-foreground lg:block">
                            {products.from ?? 0}–{products.to ?? 0} dari{' '}
                            {products.total} produk
                        </p>
                        <div className="flex items-center gap-2">
                            <label
                                htmlFor="urut"
                                className="hidden text-sm text-muted-foreground sm:block"
                            >
                                Urutkan
                            </label>
                            <Select
                                value={filters.urut}
                                onValueChange={(v) =>
                                    apply({ urut: v as CatalogFilters['urut'] })
                                }
                            >
                                <SelectTrigger id="urut" className="w-[11.5rem]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent align="end">
                                    {sorts.map((s) => (
                                        <SelectItem key={s.value} value={s.value}>
                                            {s.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {chips.length > 0 && (
                        <div className="mb-6 flex flex-wrap items-center gap-2">
                            {chips.map((chip) => (
                                <button
                                    key={chip.label}
                                    type="button"
                                    onClick={() => apply(chip.clear)}
                                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-ivory pr-2 pl-3 text-xs font-semibold text-navy hover:border-brick/40 hover:text-brick"
                                    aria-label={`Hapus filter ${chip.label}`}
                                >
                                    {chip.label}
                                    <X className="size-3.5" />
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => router.get('/produk')}
                                className="h-8 px-2 text-xs font-semibold text-teal hover:underline"
                            >
                                Hapus semua
                            </button>
                        </div>
                    )}

                    {products.data.length > 0 ? (
                        <>
                            <ProductGrid products={products.data} columns={3} />
                            <Pagination paginator={products} className="mt-12" />
                        </>
                    ) : (
                        <EmptyState
                            icon={SearchX}
                            title="Produk tidak ditemukan"
                            description="Coba kata kunci lain atau longgarkan filter yang sedang aktif."
                            action={
                                <Button variant="outline" onClick={() => router.get('/produk')}>
                                    Lihat semua produk
                                </Button>
                            }
                        />
                    )}
                </div>
            </div>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent
                    side="bottom"
                    className="max-h-[85svh] gap-0 rounded-t-2xl p-0"
                >
                    <SheetHeader className="border-b border-border px-5 py-4 text-left">
                        <SheetTitle className="font-heading text-lg font-bold text-navy">
                            Filter produk
                        </SheetTitle>
                        <SheetDescription>
                            Perubahan langsung diterapkan pada daftar produk.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="overflow-y-auto px-5 py-5">
                        <CatalogFilterPanel
                            key={`m-${filters.harga_min}-${filters.harga_maks}`}
                            filters={filters}
                            options={options}
                            onApply={apply}
                        />
                    </div>
                    <div className="pb-safe border-t border-border px-5 pt-3">
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={() => setSheetOpen(false)}
                        >
                            Lihat {products.total} produk
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
