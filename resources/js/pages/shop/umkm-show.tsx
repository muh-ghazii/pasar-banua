import { Head, Link, router } from '@inertiajs/react';
import { BadgeCheck, Instagram, MapPin, PackageOpen } from 'lucide-react';
import EmptyState from '@/components/shared/empty-state';
import Pagination from '@/components/shared/pagination';
import { ProductGrid } from '@/components/shop/product-card';
import { UmkmAvatar } from '@/components/shop/umkm-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate } from '@/lib/format';
import type { Paginated, ProductCardData } from '@/types/domain';
import type { CatalogFilters } from '@/types/shop';

type Props = {
    umkm: {
        name: string;
        slug: string;
        tagline: string | null;
        description: string | null;
        story: string | null;
        city: string;
        address: string | null;
        instagram: string | null;
        logo_url: string | null;
        cover_url: string | null;
        verified_at: string | null;
        is_demo: boolean;
    };
    products: Paginated<ProductCardData>;
    filters: CatalogFilters;
};

export default function UmkmShow({ umkm, products, filters }: Props) {
    const instagram = umkm.instagram?.replace(/^@/, '');

    return (
        <>
            <Head title={umkm.name} />
            <section>
                <div className="relative h-40 overflow-hidden bg-navy sm:h-56 lg:h-64">
                    {umkm.cover_url ? (
                        <img src={umkm.cover_url} alt="" className="size-full object-cover opacity-80" />
                    ) : (
                        <div className="motif-wave absolute inset-x-0 bottom-6 h-4 opacity-60" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
                </div>
                <div className="container-page">
                    <div className="relative -mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end">
                        <UmkmAvatar name={umkm.name} logoUrl={umkm.logo_url} className="size-20 rounded-2xl text-xl ring-4 sm:size-24" />
                        <div className="min-w-0 pb-1">
                            <h1 className="flex items-center gap-2 font-heading text-2xl font-extrabold text-navy sm:text-3xl">
                                {umkm.name}
                                <BadgeCheck className="size-6 shrink-0 text-teal" aria-label="Terverifikasi" />
                            </h1>
                            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                    <MapPin className="size-3.5" />
                                    {umkm.city}, Kalimantan Selatan
                                </span>
                                {umkm.verified_at && <span>Terverifikasi sejak {formatDate(umkm.verified_at)}</span>}
                                {instagram && (
                                    <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-teal hover:underline">
                                        <Instagram className="size-3.5" />@{instagram}
                                    </a>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                        <div>
                            {umkm.tagline && <p className="font-heading text-xl font-bold text-balance text-navy">{umkm.tagline}</p>}
                            {umkm.description && <p className="mt-3 text-[0.97rem] leading-relaxed text-pretty whitespace-pre-line text-navy-700">{umkm.description}</p>}
                        </div>
                        {(umkm.story || umkm.is_demo) && (
                            <div className="rounded-2xl bg-ivory p-5">
                                {umkm.story && (
                                    <>
                                        <p className="eyebrow text-teal">Cerita usaha</p>
                                        <p className="mt-2 text-sm leading-relaxed text-pretty whitespace-pre-line text-navy-700">{umkm.story}</p>
                                    </>
                                )}
                                {umkm.is_demo && (
                                    <p className="mt-3 rounded-lg bg-gold-100 px-3 py-2 text-xs text-gold-700">
                                        UMKM ini fiktif dan dibuat untuk demonstrasi. Tidak mewakili mitra sungguhan.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="container-page mt-12">
                <div className="mb-6 flex items-center justify-between gap-3">
                    <h2 className="font-heading text-xl font-extrabold text-navy">Produk ({products.total})</h2>
                    <Select
                        value={filters.urut}
                        onValueChange={(v) => router.get(`/umkm/${umkm.slug}`, v === 'terbaru' ? {} : { urut: v }, { preserveScroll: true, preserveState: true })}
                    >
                        <SelectTrigger className="w-[11rem]" aria-label="Urutkan produk">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="end">
                            <SelectItem value="terbaru">Terbaru</SelectItem>
                            <SelectItem value="populer">Paling laris</SelectItem>
                            <SelectItem value="termurah">Harga termurah</SelectItem>
                            <SelectItem value="termahal">Harga tertinggi</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {products.data.length === 0 ? (
                    <EmptyState
                        icon={PackageOpen}
                        title="Belum ada produk tayang"
                        action={<Link href="/produk" className="text-sm font-semibold text-teal hover:underline">Jelajahi produk lain</Link>}
                    />
                ) : (
                    <>
                        <ProductGrid products={products.data} />
                        <Pagination paginator={products} className="mt-10" />
                    </>
                )}
            </section>
        </>
    );
}
