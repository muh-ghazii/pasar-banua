import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    BookOpenText,
    ClipboardCheck,
    PackageOpen,
    Store,
    UserPlus,
} from 'lucide-react';
import { categoryIcon } from '@/components/brand/category-icon';
import ProductImage from '@/components/brand/product-visual';
import EmptyState from '@/components/shared/empty-state';
import { ProductGrid } from '@/components/shop/product-card';
import SectionHeading from '@/components/shop/section-heading';
import StoryCard from '@/components/shop/story-card';
import UmkmCard from '@/components/shop/umkm-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ProductCardData, UmkmCardData } from '@/types/domain';
import type { CategoryWithStats, StoryCardData } from '@/types/shop';

type Props = {
    categories: CategoryWithStats[];
    featured: ProductCardData[];
    stories: StoryCardData[];
    umkms: UmkmCardData[];
    stats: { umkm: number; products: number; cities: number };
};

export default function Home({
    categories,
    featured,
    stories,
    umkms,
    stats,
}: Props) {
    return (
        <>
            <Head title="Karya dan Rasa Khas Banua" />
            <Hero stats={stats} spotlight={featured[0]} />
            <ValueStrip />
            <CategorySection categories={categories} />
            <FeaturedSection products={featured} />
            <StorySection stories={stories} />
            <UmkmSection umkms={umkms} />
        </>
    );
}

function Hero({
    stats,
    spotlight,
}: {
    stats: Props['stats'];
    spotlight?: ProductCardData;
}) {
    const figures = [
        { value: stats.umkm, label: 'UMKM terverifikasi' },
        { value: stats.products, label: 'Produk terkurasi' },
        { value: stats.cities, label: 'Kota & kabupaten' },
    ];

    return (
        <section className="relative overflow-hidden">
            <div className="container-page grid items-center gap-10 pt-8 pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14 lg:pt-14 lg:pb-20">
                <div className="max-w-xl">
                    <p className="eyebrow mb-4 flex items-center gap-2 text-teal">
                        <span className="h-px w-8 bg-gold" aria-hidden="true" />
                        Marketplace terkurasi Kalimantan Selatan
                    </p>
                    <h1 className="font-heading text-[2.35rem] leading-[1.05] font-extrabold text-balance text-navy sm:text-5xl lg:text-[3.6rem]">
                        Temukan Karya dan Rasa{' '}
                        <span className="relative whitespace-nowrap text-teal">
                            Khas Banua
                            <span
                                className="motif-wave absolute inset-x-0 -bottom-3 h-4"
                                aria-hidden="true"
                            />
                        </span>
                    </h1>
                    <p className="mt-7 max-w-lg text-[1.05rem] leading-relaxed text-pretty text-navy-700">
                        Jelajahi pilihan kuliner dan kerajinan lokal Kalimantan
                        Selatan dari UMKM terbaik.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Button asChild size="lg">
                            <Link href="/produk">
                                Jelajahi Produk
                                <ArrowRight />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline">
                            <Link href="/tentang">Kenali Pasar Banua</Link>
                        </Button>
                    </div>
                    <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-border pt-6">
                        {figures.map((f) => (
                            <div key={f.label}>
                                <dt className="text-xs leading-snug text-muted-foreground">
                                    {f.label}
                                </dt>
                                <dd className="order-first font-heading text-2xl font-extrabold text-navy sm:text-[1.75rem]">
                                    {f.value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>

                <div className="relative">
                    <figure className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-navy shadow-lift sm:aspect-[5/4] lg:aspect-[4/4.4]">
                        <img
                            src="/images/hero.jpg"
                            alt="Deretan jukung berisi sayur dan buah di pasar terapung Banjarmasin"
                            className="size-full object-cover"
                            fetchPriority="high"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy/55 via-transparent to-transparent" />
                        <figcaption className="absolute bottom-3 left-4 text-[0.68rem] text-cream/80">
                            Pasar terapung, Banjarmasin · Foto: Mahfud651, CC
                            BY-SA 4.0
                        </figcaption>
                    </figure>

                    {spotlight && (
                        <Link
                            href={`/produk/${spotlight.slug}`}
                            className="group absolute -bottom-6 left-4 flex w-[min(19rem,calc(100%-2rem))] items-center gap-3 rounded-xl border border-border/70 bg-ivory p-2.5 shadow-lift transition-transform hover:-translate-y-0.5 sm:left-6 lg:-left-8"
                        >
                            <span className="size-16 shrink-0 overflow-hidden rounded-lg bg-cream-200">
                                <ProductImage
                                    src={spotlight.image_url}
                                    alt=""
                                    name={spotlight.name}
                                    categorySlug={spotlight.category?.slug}
                                    label={false}
                                />
                            </span>
                            <span className="min-w-0">
                                <span className="block text-[0.65rem] font-bold tracking-wide text-gold-700 uppercase">
                                    Pilihan minggu ini
                                </span>
                                <span className="mt-0.5 block truncate font-heading text-sm font-bold text-navy group-hover:text-teal">
                                    {spotlight.name}
                                </span>
                                <span className="block truncate text-xs text-muted-foreground">
                                    {spotlight.umkm?.name}
                                </span>
                            </span>
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}

function ValueStrip() {
    const items = [
        {
            icon: BadgeCheck,
            title: 'Dikurasi sebelum tayang',
            text: 'Setiap UMKM diverifikasi dan setiap produk ditinjau tim kurator.',
        },
        {
            icon: BookOpenText,
            title: 'Cerita di balik produk',
            text: 'Kenali bahan, proses, dan orang yang membuat produk pilihan Anda.',
        },
        {
            icon: Store,
            title: 'Langsung dari pembuatnya',
            text: 'Pesanan diteruskan ke UMKM tanpa perantara tambahan.',
        },
    ];

    return (
        <section aria-label="Keunggulan Pasar Banua" className="border-y border-border bg-ivory/70">
            <ul className="container-page grid gap-6 py-8 sm:grid-cols-3 sm:gap-8">
                {items.map((item) => (
                    <li key={item.title} className="flex gap-3.5">
                        <item.icon
                            className="mt-0.5 size-6 shrink-0 text-teal"
                            strokeWidth={1.6}
                        />
                        <div>
                            <p className="font-heading text-[0.95rem] font-bold text-navy">
                                {item.title}
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-pretty text-muted-foreground">
                                {item.text}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}

function CategorySection({ categories }: { categories: CategoryWithStats[] }) {
    if (categories.length === 0) {
        return null;
    }

    return (
        <section className="container-page pt-16 lg:pt-24">
            <SectionHeading
                eyebrow="Kategori"
                title="Mulai dari yang paling Anda cari"
                href="/kategori"
                linkLabel="Semua kategori"
            />
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:grid-rows-[15rem_15rem]">
                {categories.slice(0, 4).map((c, i) => {
                    const Icon = categoryIcon(c.icon);
                    const large = i === 0;

                    return (
                        <Link
                            key={c.id}
                            href={`/produk?kategori=${c.slug}`}
                            className={cn(
                                'group relative isolate flex min-h-44 flex-col justify-end overflow-hidden rounded-2xl bg-navy p-4 text-cream sm:min-h-52 sm:p-5',
                                large && 'col-span-2 min-h-56 lg:row-span-2',
                                i === 3 && 'lg:col-span-2',
                            )}
                        >
                            {!c.cover_url && (
                                <div className="motif-wave absolute inset-x-0 bottom-16 -z-10 h-4 opacity-40" aria-hidden="true" />
                            )}
                            {c.cover_url && (
                                <img
                                    src={c.cover_url}
                                    alt=""
                                    loading="lazy"
                                    className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                />
                            )}
                            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy/90 via-navy/35 to-navy/5" />
                            <span className="mb-auto flex size-10 items-center justify-center rounded-full bg-ivory/15 text-gold backdrop-blur-sm">
                                <Icon className="size-5" strokeWidth={1.75} />
                            </span>
                            <h3
                                className={cn(
                                    'font-heading font-extrabold',
                                    large ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl',
                                )}
                            >
                                {c.name}
                            </h3>
                            {large && c.description && (
                                <p className="mt-1.5 max-w-sm text-sm text-pretty text-cream/80">
                                    {c.description}
                                </p>
                            )}
                            <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-gold">
                                {c.products_count} produk
                                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                            </p>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}

function FeaturedSection({ products }: { products: ProductCardData[] }) {
    return (
        <section className="container-page pt-16 lg:pt-24">
            <SectionHeading
                eyebrow="Produk pilihan"
                title="Dipilih kurator dari dapur dan bengkel UMKM Banua"
                href="/produk?urut=populer"
            />
            {products.length > 0 ? (
                <ProductGrid products={products} />
            ) : (
                <EmptyState
                    icon={PackageOpen}
                    title="Produk sedang dikurasi"
                    description="Belum ada produk yang tayang. Kunjungi kembali dalam waktu dekat."
                />
            )}
        </section>
    );
}

function StorySection({ stories }: { stories: StoryCardData[] }) {
    if (stories.length === 0) {
        return null;
    }

    const [first, ...rest] = stories;

    return (
        <section className="mt-16 bg-navy py-16 lg:mt-24 lg:py-24">
            <div className="container-page">
                <SectionHeading
                    tone="light"
                    eyebrow="Cerita Banua"
                    title="Setiap produk membawa cerita tentang tempat asalnya"
                    description="Bahan yang dipilih, cara membuat yang diwariskan, dan orang-orang di baliknya. Cerita yang belum diverifikasi kurator kami tandai sebagai konten contoh."
                    href="/cerita-banua"
                    linkLabel="Baca semua cerita"
                />
                <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-12">
                    <StoryCard story={first} variant="feature" tone="light" />
                    <div className="grid content-start gap-10">
                        {rest.map((s) => (
                            <StoryCard key={s.id} story={s} tone="light" />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function UmkmSection({ umkms }: { umkms: UmkmCardData[] }) {
    const { auth } = usePage().props;
    const steps = [
        { icon: UserPlus, title: 'Daftar akun UMKM', text: 'Isi data usaha dan kontak.' },
        { icon: ClipboardCheck, title: 'Diverifikasi admin', text: 'Kami meninjau profil usaha Anda.' },
        { icon: PackageOpen, title: 'Unggah produk', text: 'Produk tayang setelah dikurasi.' },
    ];

    return (
        <section className="container-page pt-16 lg:pt-24">
            <SectionHeading
                eyebrow="UMKM lokal"
                title="Kenali para pembuatnya"
                href="/umkm"
                linkLabel="Semua UMKM"
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {umkms.map((u) => (
                    <UmkmCard key={u.id} umkm={u} />
                ))}
            </div>

            {auth.user?.role !== 'seller' && (
                <div className="relative mt-12 overflow-hidden rounded-2xl bg-teal text-ivory">
                    <div
                        className="motif-wave absolute inset-x-0 top-0 h-4 opacity-50"
                        aria-hidden="true"
                    />
                    <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-center lg:p-12">
                        <div>
                            <p className="eyebrow text-gold-100">Untuk pelaku UMKM</p>
                            <h2 className="mt-2 font-heading text-2xl leading-tight font-extrabold text-balance sm:text-3xl">
                                Punya produk khas Banua? Jual di Pasar Banua.
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-pretty text-ivory/80">
                                Kelola katalog, stok, dan pesanan dari satu
                                dashboard, lengkap dengan panduan untuk mulai
                                berjualan online.
                            </p>
                            <Button asChild variant="gold" size="lg" className="mt-6">
                                <Link href="/register?sebagai=umkm">
                                    Gabung sebagai UMKM
                                    <ArrowRight />
                                </Link>
                            </Button>
                        </div>
                        <ol className="grid gap-3 sm:grid-cols-3">
                            {steps.map((s, i) => (
                                <li
                                    key={s.title}
                                    className="rounded-xl bg-teal-700/70 p-4"
                                >
                                    <span className="flex items-center justify-between">
                                        <s.icon
                                            className="size-5 text-gold-100"
                                            strokeWidth={1.75}
                                        />
                                        <span className="font-heading text-xs font-bold text-ivory/50">
                                            0{i + 1}
                                        </span>
                                    </span>
                                    <p className="mt-4 font-heading text-sm font-bold">
                                        {s.title}
                                    </p>
                                    <p className="mt-1 text-xs text-ivory/75">
                                        {s.text}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            )}
        </section>
    );
}
