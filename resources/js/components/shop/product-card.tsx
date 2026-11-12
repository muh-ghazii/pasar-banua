import { Link, router } from '@inertiajs/react';
import { MapPin, Plus } from 'lucide-react';
import { useState } from 'react';
import ProductImage from '@/components/brand/product-visual';
import { RatingInline } from '@/components/shared/rating';
import { Spinner } from '@/components/ui/spinner';
import { formatRupiah } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ProductCardData } from '@/types/domain';

/**
 * Kartu produk untuk katalog dan rekomendasi. Foto menjadi elemen utama;
 * tombol tambah cepat mengirim ke keranjang di backend.
 */
export default function ProductCard({
    product,
    className,
    priority = false,
}: {
    product: ProductCardData;
    className?: string;
    priority?: boolean;
}) {
    const [adding, setAdding] = useState(false);
    const soldOut = product.stock < 1;
    const href = `/produk/${product.slug}`;

    function addToCart() {
        router.post(
            '/keranjang',
            { product_id: product.id, quantity: 1 },
            {
                preserveScroll: true,
                onStart: () => setAdding(true),
                onFinish: () => setAdding(false),
            },
        );
    }

    return (
        <article
            className={cn(
                'group relative flex min-w-0 flex-col',
                className,
            )}
        >
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-cream-200">
                <Link
                    href={href}
                    prefetch
                    tabIndex={-1}
                    aria-hidden="true"
                    className="block size-full"
                >
                    <ProductImage
                        src={product.image_url}
                        alt={product.image_alt}
                        name={product.name}
                        categorySlug={product.category?.slug}
                        icon={product.category?.icon}
                        priority={priority}
                        className="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                </Link>

                <div className="pointer-events-none absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-2">
                    {product.is_featured ? (
                        <span className="rounded-md bg-navy/90 px-2 py-1 text-[0.62rem] font-bold tracking-wide text-cream uppercase">
                            Pilihan kurator
                        </span>
                    ) : (
                        <span />
                    )}
                    {soldOut && (
                        <span className="rounded-md bg-ivory/95 px-2 py-1 text-[0.62rem] font-bold tracking-wide text-brick uppercase">
                            Stok habis
                        </span>
                    )}
                </div>

                {!soldOut && (
                    <button
                        type="button"
                        onClick={addToCart}
                        disabled={adding}
                        aria-label={`Tambah ${product.name} ke keranjang`}
                        className="absolute right-2.5 bottom-2.5 z-10 flex size-10 items-center justify-center rounded-full bg-ivory text-teal shadow-lift transition-[background-color,color,transform] hover:bg-teal hover:text-ivory focus-visible:bg-teal focus-visible:text-ivory active:scale-95 disabled:opacity-70 sm:size-11"
                    >
                        {adding ? (
                            <Spinner className="size-4" />
                        ) : (
                            <Plus className="size-5" strokeWidth={2} />
                        )}
                    </button>
                )}
            </div>

            <div className="flex flex-1 flex-col pt-3">
                {product.category && (
                    <p className="text-[0.7rem] font-semibold tracking-wide text-gold-700 uppercase">
                        {product.category.name}
                    </p>
                )}
                <h3 className="mt-1 line-clamp-2 font-heading text-[0.95rem] leading-snug font-bold text-navy sm:text-base">
                    <Link
                        href={href}
                        prefetch
                        className="outline-none after:absolute after:inset-0 after:z-0 after:content-[''] hover:text-teal focus-visible:underline"
                    >
                        {product.name}
                    </Link>
                </h3>
                {product.umkm && (
                    <p className="mt-1 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                        <span className="truncate">{product.umkm.name}</span>
                        <span aria-hidden="true">·</span>
                        <MapPin className="size-3 shrink-0" strokeWidth={1.75} />
                        <span className="truncate">{product.umkm.city}</span>
                    </p>
                )}
                <div className="mt-auto flex flex-wrap items-end justify-between gap-x-2 gap-y-1 pt-2.5">
                    <p className="font-heading text-[1.05rem] font-extrabold text-navy">
                        {formatRupiah(product.price)}
                    </p>
                    <RatingInline
                        rating={product.rating}
                        count={product.reviews_count}
                    />
                </div>
            </div>
        </article>
    );
}

/** Grid produk standar: 2 kolom di ponsel, 3 di tablet, 4 di desktop. */
export function ProductGrid({
    products,
    className,
    columns = 4,
}: {
    products: ProductCardData[];
    className?: string;
    columns?: 3 | 4;
}) {
    return (
        <div
            className={cn(
                'grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 sm:gap-y-9 md:grid-cols-3',
                columns === 4 && 'xl:grid-cols-4',
                className,
            )}
        >
            {products.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
        </div>
    );
}
