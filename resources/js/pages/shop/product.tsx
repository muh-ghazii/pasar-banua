import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    BadgeCheck,
    ChevronRight,
    Eye,
    Hammer,
    Leaf,
    MapPin,
    MessageSquareText,
    Package,
    ScrollText,
    ShoppingBag,
    Star,
    Store,
    Truck,
} from 'lucide-react';
import { useState } from 'react';
import ProductImage from '@/components/brand/product-visual';
import Pagination from '@/components/shared/pagination';
import QuantityStepper from '@/components/shared/quantity-stepper';
import { RatingStars } from '@/components/shared/rating';
import { ProductGrid } from '@/components/shop/product-card';
import SectionHeading from '@/components/shop/section-heading';
import { StoryVerificationNote } from '@/components/shop/story-card';
import { UmkmAvatar } from '@/components/shop/umkm-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { formatDate, formatNumber, formatRupiah } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Paginated, ProductCardData } from '@/types/domain';
import type { StoryDetail } from '@/types/shop';

type ProductDetail = {
    id: number;
    name: string;
    slug: string;
    summary: string | null;
    description: string | null;
    price: number;
    stock: number;
    weight_gram: number | null;
    sold_count: number;
    is_featured: boolean;
    is_demo: boolean;
    rating: number | null;
    reviews_count: number;
    category: { name: string; slug: string; icon: string | null } | null;
    images: { id: number; url: string | null; alt: string }[];
};

type Review = {
    id: number;
    rating: number;
    comment: string | null;
    author: string;
    created_at: string | null;
};

type Props = {
    product: ProductDetail;
    story: StoryDetail | null;
    umkm: {
        name: string;
        slug: string;
        city: string;
        tagline: string | null;
        description: string | null;
        logo_url: string | null;
        is_demo: boolean;
    } | null;
    reviews: Paginated<Review>;
    ratingDistribution: { star: number; count: number }[];
    related: ProductCardData[];
    canReview: boolean;
    myReview: { id: number; rating: number; comment: string | null } | null;
    isPreview: boolean;
    previewStatus: { status: string; label: string; active: boolean } | null;
};

export default function ProductPage(props: Props) {
    const { product, story, umkm, related, isPreview, previewStatus } = props;

    return (
        <>
            <Head title={product.name}>
                {product.summary && (
                    <meta name="description" content={product.summary} />
                )}
            </Head>

            {isPreview && previewStatus && (
                <div className="border-b border-gold/40 bg-gold-100">
                    <p className="container-page flex items-center gap-2 py-2.5 text-sm text-gold-700">
                        <Eye className="size-4 shrink-0" />
                        <span>
                            <strong>Pratinjau.</strong> Produk ini belum tayang
                            untuk publik (status: {previewStatus.label}
                            {previewStatus.active ? '' : ', nonaktif'}).
                        </span>
                    </p>
                </div>
            )}

            <div className="container-page pt-5 lg:pt-8">
                <Breadcrumb product={product} />

                <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
                    <Gallery product={product} />
                    <PurchasePanel
                        product={product}
                        umkm={umkm}
                        disabled={isPreview}
                    />
                </div>
            </div>

            <div className="container-page mt-14 grid gap-12 lg:mt-20 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16">
                <div className="min-w-0 space-y-14">
                    <section aria-labelledby="deskripsi">
                        <h2
                            id="deskripsi"
                            className="font-heading text-2xl font-extrabold text-navy"
                        >
                            Tentang produk
                        </h2>
                        <div className="mt-4 space-y-4 text-[0.97rem] leading-relaxed text-pretty whitespace-pre-line text-navy-700">
                            {product.description ||
                                product.summary ||
                                'Penjual belum menambahkan deskripsi.'}
                        </div>
                        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <Spec label="Kategori" value={product.category?.name ?? '-'} />
                            <Spec
                                label="Berat"
                                value={
                                    product.weight_gram
                                        ? `${formatNumber(product.weight_gram)} g`
                                        : '-'
                                }
                            />
                            <Spec label="Terjual" value={`${formatNumber(product.sold_count)} unit`} />
                        </dl>
                    </section>

                    {story && <StorySection story={story} slug={product.slug} />}

                    <ReviewsSection {...props} />
                </div>

                {umkm && <UmkmAside umkm={umkm} />}
            </div>

            {related.length > 0 && (
                <section className="container-page mt-16 lg:mt-24">
                    <SectionHeading
                        eyebrow="Produk terkait"
                        title={`Lainnya dari ${product.category?.name ?? 'kategori ini'}`}
                        href={
                            product.category
                                ? `/produk?kategori=${product.category.slug}`
                                : '/produk'
                        }
                    />
                    <ProductGrid products={related} />
                </section>
            )}

            {/* Ruang untuk bar beli yang menempel di ponsel */}
            {!isPreview && <div className="h-16 lg:hidden" aria-hidden="true" />}
        </>
    );
}

function Breadcrumb({ product }: { product: ProductDetail }) {
    return (
        <nav aria-label="Breadcrumb">
            <ol className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                <li>
                    <Link href="/produk" className="hover:text-teal">
                        Produk
                    </Link>
                </li>
                {product.category && (
                    <>
                        <ChevronRight className="size-3.5 shrink-0" />
                        <li>
                            <Link
                                href={`/produk?kategori=${product.category.slug}`}
                                className="hover:text-teal"
                            >
                                {product.category.name}
                            </Link>
                        </li>
                    </>
                )}
                <ChevronRight className="size-3.5 shrink-0" />
                <li className="truncate font-semibold text-navy" aria-current="page">
                    {product.name}
                </li>
            </ol>
        </nav>
    );
}

function Gallery({ product }: { product: ProductDetail }) {
    const [active, setActive] = useState(0);
    const images = product.images;
    const current = images[active];

    return (
        <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-cream-200 sm:aspect-[5/4] lg:aspect-square">
                <ProductImage
                    key={current?.id ?? 'fallback'}
                    src={current?.url}
                    alt={current?.alt}
                    name={product.name}
                    categorySlug={product.category?.slug}
                    icon={product.category?.icon}
                    priority
                    className="animate-in fade-in duration-300"
                />
                {product.is_featured && (
                    <span className="absolute top-3 left-3 rounded-md bg-navy/90 px-2.5 py-1 text-[0.68rem] font-bold tracking-wide text-cream uppercase">
                        Pilihan kurator
                    </span>
                )}
            </div>
            {images.length > 1 && (
                <div
                    className="no-scrollbar mt-3 flex gap-2.5 overflow-x-auto"
                    role="tablist"
                    aria-label="Foto produk"
                >
                    {images.map((img, i) => (
                        <button
                            key={img.id}
                            type="button"
                            role="tab"
                            aria-selected={i === active}
                            aria-label={`Foto ${i + 1}`}
                            onClick={() => setActive(i)}
                            className={cn(
                                'size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors sm:size-20',
                                i === active
                                    ? 'border-teal'
                                    : 'border-transparent opacity-75 hover:opacity-100',
                            )}
                        >
                            <ProductImage
                                src={img.url}
                                alt=""
                                name={product.name}
                                categorySlug={product.category?.slug}
                                label={false}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function PurchasePanel({
    product,
    umkm,
    disabled,
}: {
    product: ProductDetail;
    umkm: Props['umkm'];
    disabled: boolean;
}) {
    const [quantity, setQuantity] = useState(1);
    const [processing, setProcessing] = useState(false);
    const soldOut = product.stock < 1;
    const lowStock = !soldOut && product.stock <= 5;

    function add(goToCart = false) {
        router.post(
            '/keranjang',
            { product_id: product.id, quantity },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onSuccess: () => {
                    if (goToCart) {
                        router.visit('/keranjang');
                    }
                },
            },
        );
    }

    return (
        <div className="min-w-0">
            {product.category && (
                <p className="eyebrow text-gold-700">{product.category.name}</p>
            )}
            <h1 className="mt-2 font-heading text-[1.9rem] leading-[1.12] font-extrabold text-balance text-navy sm:text-4xl">
                {product.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
                {product.rating !== null && product.reviews_count > 0 ? (
                    <a href="#ulasan" className="inline-flex items-center gap-1.5 hover:underline">
                        <RatingStars value={product.rating} />
                        <span className="font-semibold text-navy">
                            {product.rating.toFixed(1).replace('.', ',')}
                        </span>
                        <span className="text-muted-foreground">
                            ({product.reviews_count} ulasan)
                        </span>
                    </a>
                ) : (
                    <span className="text-muted-foreground">Belum ada ulasan</span>
                )}
                <span className="text-border" aria-hidden="true">|</span>
                <span className="text-muted-foreground">
                    {formatNumber(product.sold_count)} terjual
                </span>
            </div>

            <p className="mt-6 font-heading text-[2rem] font-extrabold text-navy">
                {formatRupiah(product.price)}
            </p>

            {product.summary && (
                <p className="mt-4 text-[0.97rem] leading-relaxed text-pretty text-navy-700">
                    {product.summary}
                </p>
            )}

            {umkm && (
                <Link
                    href={`/umkm/${umkm.slug}`}
                    className="mt-6 flex items-center gap-3 rounded-xl border border-border/80 bg-card p-3 transition-colors hover:border-teal/40"
                >
                    <UmkmAvatar name={umkm.name} logoUrl={umkm.logo_url} className="size-11 ring-0" />
                    <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 font-heading text-sm font-bold text-navy">
                            <span className="truncate">{umkm.name}</span>
                            <BadgeCheck className="size-4 shrink-0 text-teal" />
                        </span>
                        <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="size-3.5" />
                            {umkm.city}, Kalimantan Selatan
                        </span>
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
            )}

            <div className="mt-6 rounded-2xl border border-border/80 bg-ivory p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-navy">Jumlah</span>
                    <span
                        className={cn(
                            'text-sm',
                            soldOut
                                ? 'font-semibold text-brick'
                                : lowStock
                                  ? 'font-semibold text-gold-700'
                                  : 'text-muted-foreground',
                        )}
                    >
                        {soldOut
                            ? 'Stok habis'
                            : lowStock
                              ? `Tersisa ${product.stock}`
                              : `Stok ${formatNumber(product.stock)}`}
                    </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                    <QuantityStepper
                        value={quantity}
                        onChange={setQuantity}
                        max={Math.max(1, Math.min(product.stock, 99))}
                        disabled={soldOut || disabled}
                    />
                    <p className="text-right text-sm text-muted-foreground">
                        Subtotal
                        <span className="block font-heading text-lg font-extrabold text-navy">
                            {formatRupiah(product.price * quantity)}
                        </span>
                    </p>
                </div>

                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    <Button
                        size="lg"
                        variant="outline"
                        disabled={soldOut || disabled || processing}
                        onClick={() => add(false)}
                    >
                        {processing ? <Spinner /> : <ShoppingBag />}
                        Tambah ke Keranjang
                    </Button>
                    <Button
                        size="lg"
                        disabled={soldOut || disabled || processing}
                        onClick={() => add(true)}
                    >
                        Beli sekarang
                    </Button>
                </div>
            </div>

            <ul className="mt-5 grid gap-2.5 text-sm text-navy-700">
                <li className="flex items-start gap-2.5">
                    <Truck className="mt-0.5 size-4 shrink-0 text-teal" />
                    Ongkos kirim tarif tetap per UMKM, dihitung saat checkout.
                </li>
                <li className="flex items-start gap-2.5">
                    <Package className="mt-0.5 size-4 shrink-0 text-teal" />
                    Dikemas dan dikirim langsung oleh UMKM pembuatnya.
                </li>
            </ul>

            {/* Tombol beli yang selalu terjangkau di ponsel */}
            {!disabled && (
                <div className="pb-safe fixed inset-x-0 bottom-14 z-30 border-t border-border bg-background/95 px-4 pt-2.5 backdrop-blur lg:hidden">
                    <div className="mx-auto flex max-w-lg items-center gap-3">
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs text-muted-foreground">
                                {quantity} × {product.name}
                            </p>
                            <p className="font-heading text-base font-extrabold text-navy">
                                {formatRupiah(product.price * quantity)}
                            </p>
                        </div>
                        <Button
                            disabled={soldOut || processing}
                            onClick={() => add(false)}
                        >
                            {processing ? <Spinner /> : <ShoppingBag />}
                            {soldOut ? 'Stok habis' : 'Tambah'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

function Spec({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl bg-ivory px-4 py-3">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 text-sm font-semibold text-navy">{value}</dd>
        </div>
    );
}

function StorySection({ story, slug }: { story: StoryDetail; slug: string }) {
    const notes = [
        { icon: Hammer, title: 'Proses pembuatan', text: story.process_note },
        { icon: Leaf, title: 'Bahan', text: story.material_note },
        { icon: ScrollText, title: 'Nilai budaya', text: story.cultural_note },
    ].filter((n) => n.text);

    return (
        <section
            aria-labelledby="cerita"
            className="relative overflow-hidden rounded-2xl bg-navy p-6 text-cream sm:p-8"
        >
            <div className="motif-wave absolute inset-x-0 top-0 h-4 opacity-60" aria-hidden="true" />
            <div className="flex flex-wrap items-center gap-2">
                <p className="eyebrow text-gold">Cerita produk</p>
                <StoryVerificationNote verified={story.is_verified} tone="light" />
            </div>
            <h2
                id="cerita"
                className="mt-3 font-heading text-2xl leading-tight font-extrabold text-balance"
            >
                {story.title}
            </h2>
            <p className="mt-4 line-clamp-6 text-[0.97rem] leading-relaxed text-pretty whitespace-pre-line text-cream/80">
                {story.body}
            </p>
            {notes.length > 0 && (
                <dl className="mt-6 grid gap-4 sm:grid-cols-3">
                    {notes.map((n) => (
                        <div key={n.title} className="rounded-xl bg-navy-800 p-4">
                            <dt className="flex items-center gap-2 text-sm font-bold text-gold">
                                <n.icon className="size-4" strokeWidth={1.75} />
                                {n.title}
                            </dt>
                            <dd className="mt-1.5 line-clamp-4 text-sm text-cream/75">{n.text}</dd>
                        </div>
                    ))}
                </dl>
            )}
            {!story.is_verified && (
                <p className="mt-5 text-xs text-cream/55">
                    Cerita ini merupakan konten contoh dari penjual dan belum
                    diverifikasi sebagai fakta sejarah atau budaya.
                </p>
            )}
            <Button asChild variant="outline-light" size="sm" className="mt-5">
                <Link href={`/cerita-banua/${slug}`}>Baca cerita lengkap</Link>
            </Button>
        </section>
    );
}

function UmkmAside({ umkm }: { umkm: NonNullable<Props['umkm']> }) {
    return (
        <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border/80 bg-card p-6">
                <p className="eyebrow text-teal">Asal UMKM</p>
                <div className="mt-4 flex items-center gap-3">
                    <UmkmAvatar name={umkm.name} logoUrl={umkm.logo_url} className="size-14 ring-0" />
                    <div className="min-w-0">
                        <p className="font-heading text-lg font-bold text-navy">{umkm.name}</p>
                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="size-3.5" />
                            {umkm.city}
                        </p>
                    </div>
                </div>
                {umkm.tagline && (
                    <p className="mt-4 font-heading text-[0.95rem] font-semibold text-pretty text-navy-700">
                        “{umkm.tagline}”
                    </p>
                )}
                {umkm.description && (
                    <p className="mt-3 line-clamp-5 text-sm leading-relaxed text-pretty text-muted-foreground">
                        {umkm.description}
                    </p>
                )}
                {umkm.is_demo && (
                    <p className="mt-4 rounded-lg bg-gold-100 px-3 py-2 text-xs text-gold-700">
                        Profil UMKM ini fiktif untuk keperluan demonstrasi.
                    </p>
                )}
                <Button asChild variant="navy" className="mt-5 w-full">
                    <Link href={`/umkm/${umkm.slug}`}>
                        <Store />
                        Kunjungi toko
                    </Link>
                </Button>
            </div>
        </aside>
    );
}

function ReviewsSection({
    product,
    reviews,
    ratingDistribution,
    canReview,
    myReview,
}: Props) {
    const total = ratingDistribution.reduce((a, b) => a + b.count, 0);

    return (
        <section id="ulasan" aria-labelledby="ulasan-title" className="scroll-mt-24">
            <h2 id="ulasan-title" className="font-heading text-2xl font-extrabold text-navy">
                Ulasan pembeli
            </h2>

            <div className="mt-5 grid gap-6 rounded-2xl border border-border/80 bg-card p-5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:p-6">
                <div className="flex flex-col items-start justify-center">
                    <p className="font-heading text-5xl font-extrabold text-navy">
                        {product.rating !== null ? product.rating.toFixed(1).replace('.', ',') : '–'}
                    </p>
                    <RatingStars value={product.rating ?? 0} className="mt-2" />
                    <p className="mt-1.5 text-xs text-muted-foreground">{total} ulasan</p>
                </div>
                <ul className="grid gap-1.5">
                    {ratingDistribution.map((r) => (
                        <li key={r.star} className="flex items-center gap-3 text-xs">
                            <span className="inline-flex w-7 items-center gap-0.5 font-semibold text-navy">
                                {r.star}
                                <Star className="size-3 fill-gold text-gold" />
                            </span>
                            <span className="h-2 flex-1 overflow-hidden rounded-full bg-cream-200">
                                <span
                                    className="block h-full rounded-full bg-gold"
                                    style={{ width: total ? `${(r.count / total) * 100}%` : '0%' }}
                                />
                            </span>
                            <span className="w-6 text-right text-muted-foreground">{r.count}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {canReview && <ReviewForm slug={product.slug} existing={myReview} />}

            {reviews.data.length > 0 ? (
                <ul className="mt-6 divide-y divide-border">
                    {reviews.data.map((r) => (
                        <li key={r.id} className="py-5">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-bold text-navy">{r.author}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(r.created_at)}</p>
                            </div>
                            <RatingStars value={r.rating} size="size-3.5" className="mt-1" />
                            {r.comment && (
                                <p className="mt-2 text-sm leading-relaxed text-pretty text-navy-700">
                                    {r.comment}
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquareText className="size-4" />
                    Belum ada ulasan. Ulasan dapat diberikan setelah pesanan selesai.
                </p>
            )}
            <Pagination paginator={reviews} only={['reviews']} className="mt-4" />
        </section>
    );
}

function ReviewForm({
    slug,
    existing,
}: {
    slug: string;
    existing: Props['myReview'];
}) {
    const form = useForm({
        rating: existing?.rating ?? 5,
        comment: existing?.comment ?? '',
    });

    return (
        <form
            className="mt-5 rounded-2xl border border-teal/30 bg-teal-50/60 p-5"
            onSubmit={(e) => {
                e.preventDefault();
                form.post(`/produk/${slug}/ulasan`, { preserveScroll: true });
            }}
        >
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-heading text-sm font-bold text-navy">
                    {existing ? 'Perbarui ulasan Anda' : 'Bagikan pengalaman Anda'}
                </p>
                <Badge variant="teal">Pembelian terverifikasi</Badge>
            </div>
            <div className="mt-3 flex gap-1" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((n) => (
                    <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={form.data.rating === n}
                        aria-label={`${n} bintang`}
                        onClick={() => form.setData('rating', n)}
                        className="rounded p-0.5"
                    >
                        <Star
                            className={cn(
                                'size-7',
                                n <= form.data.rating ? 'fill-gold text-gold' : 'text-cream-300',
                            )}
                            strokeWidth={1.5}
                        />
                    </button>
                ))}
            </div>
            <label htmlFor="review-comment" className="sr-only">
                Ulasan
            </label>
            <Textarea
                id="review-comment"
                className="mt-3 bg-ivory"
                rows={3}
                maxLength={1000}
                placeholder="Bagaimana rasa, kualitas, atau kemasannya?"
                value={form.data.comment}
                onChange={(e) => form.setData('comment', e.target.value)}
            />
            {form.errors.comment && (
                <p className="mt-1 text-xs text-brick">{form.errors.comment}</p>
            )}
            <Button type="submit" className="mt-3" disabled={form.processing}>
                {form.processing && <Spinner />}
                Kirim ulasan
            </Button>
        </form>
    );
}
