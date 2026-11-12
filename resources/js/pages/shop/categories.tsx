import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Tags } from 'lucide-react';
import { categoryIcon } from '@/components/brand/category-icon';
import EmptyState from '@/components/shared/empty-state';
import type { CategoryWithStats } from '@/types/shop';

export default function Categories({ categories }: { categories: CategoryWithStats[] }) {
    return (
        <>
            <Head title="Kategori" />
            <div className="container-page py-8 lg:py-12">
                <p className="eyebrow mb-2 text-teal">Kategori</p>
                <h1 className="font-heading text-3xl font-extrabold text-navy sm:text-4xl">Jelajahi berdasarkan kategori</h1>
                <p className="mt-2 max-w-xl text-sm text-pretty text-muted-foreground">
                    Dari camilan khas pesisir hingga kain bermotif garis, setiap kategori berisi produk UMKM yang sudah dikurasi.
                </p>

                {categories.length === 0 ? (
                    <EmptyState icon={Tags} title="Belum ada kategori" className="mt-8" />
                ) : (
                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        {categories.map((c) => {
                            const Icon = categoryIcon(c.icon);

                            return (
                                <Link
                                    key={c.id}
                                    href={`/produk?kategori=${c.slug}`}
                                    className="group grid grid-cols-[7.5rem_minmax(0,1fr)] overflow-hidden rounded-2xl border border-border/80 bg-card transition-shadow hover:shadow-lift sm:grid-cols-[10rem_minmax(0,1fr)]"
                                >
                                    <div className="relative bg-navy">
                                        {c.cover_url && (
                                            <img src={c.cover_url} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        )}
                                    </div>
                                    <div className="flex flex-col p-5">
                                        <span className="flex size-9 items-center justify-center rounded-lg bg-teal-50 text-teal">
                                            <Icon className="size-[18px]" strokeWidth={1.75} />
                                        </span>
                                        <h2 className="mt-3 font-heading text-lg font-bold text-navy group-hover:text-teal">{c.name}</h2>
                                        {c.description && (
                                            <p className="mt-1 line-clamp-2 text-sm text-pretty text-muted-foreground">{c.description}</p>
                                        )}
                                        <p className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-bold text-teal">
                                            {c.products_count} produk
                                            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
