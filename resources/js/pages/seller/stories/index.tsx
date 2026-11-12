import { Head, Link } from '@inertiajs/react';
import { BookOpenText, PenLine, Plus } from 'lucide-react';
import ProductImage from '@/components/brand/product-visual';
import PageHeader from '@/components/dashboard/page-header';
import FilterPills, { withQuery } from '@/components/seller/filter-pills';
import EmptyState from '@/components/shared/empty-state';
import Pagination from '@/components/shared/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { timeAgo } from '@/lib/format';
import type { Paginated } from '@/types/domain';
import type { StoryRow } from '@/types/seller';

type Props = {
    products: Paginated<StoryRow>;
    summary: { total: number; with_story: number };
    filters: { filter: 'semua' | 'ada' | 'belum' };
};

export default function SellerStories({ products, summary, filters }: Props) {
    const percent = summary.total ? Math.round((summary.with_story / summary.total) * 100) : 0;

    return (
        <>
            <Head title="Cerita produk" />
            <PageHeader
                eyebrow="Storytelling"
                title="Cerita produk"
                description="Cerita adalah pembeda Pasar Banua. Ceritakan asal-usul, proses, dan bahan produk Anda dengan jujur."
            />

            <div className="mb-6 grid gap-4 rounded-2xl border border-border/80 bg-card p-5 shadow-soft sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                    <p className="text-sm font-semibold text-navy">
                        {summary.with_story} dari {summary.total} produk sudah memiliki cerita
                    </p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-cream-200" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Kelengkapan cerita produk">
                        <div className="h-full rounded-full bg-gold" style={{ width: `${percent}%` }} />
                    </div>
                </div>
                <p className="max-w-sm text-xs text-pretty text-muted-foreground">
                    Cerita tulisan UMKM tampil dengan label <span className="font-semibold text-navy">konten contoh / belum diverifikasi</span>{' '}
                    sampai ditinjau tim Pasar Banua. Hindari mengklaim sejarah atau filosofi yang belum pasti.
                </p>
            </div>

            <FilterPills
                className="mb-5"
                label="Filter cerita"
                items={[
                    { label: 'Semua', value: 'semua', count: summary.total },
                    { label: 'Sudah ada cerita', value: 'ada', count: summary.with_story },
                    { label: 'Belum ada cerita', value: 'belum', count: summary.total - summary.with_story },
                ].map((f) => ({
                    label: f.label,
                    count: f.count,
                    active: filters.filter === f.value,
                    href: withQuery('/seller/cerita', { filter: f.value === 'semua' ? '' : f.value }),
                }))}
            />

            {products.data.length === 0 ? (
                <EmptyState
                    icon={BookOpenText}
                    title={summary.total === 0 ? 'Belum ada produk' : 'Tidak ada produk pada filter ini'}
                    description={summary.total === 0 ? 'Tambahkan produk terlebih dahulu, lalu tulis ceritanya di sini.' : undefined}
                    action={
                        <Button asChild variant="outline">
                            <Link href={summary.total === 0 ? '/seller/produk/tambah' : '/seller/cerita'}>
                                {summary.total === 0 ? 'Tambah produk' : 'Lihat semua'}
                            </Link>
                        </Button>
                    }
                />
            ) : (
                <>
                    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {products.data.map((p) => (
                            <li key={p.id} className="flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-soft">
                                <div className="aspect-[16/9] overflow-hidden bg-cream-200">
                                    <ProductImage src={p.image_url} name={p.name} categorySlug={p.category?.slug} icon={p.category?.icon} label={false} />
                                </div>
                                <div className="flex flex-1 flex-col p-4">
                                    <p className="text-xs font-semibold text-muted-foreground">{p.name}</p>
                                    {p.story ? (
                                        <>
                                            <h2 className="mt-1 line-clamp-2 font-heading text-base font-bold text-navy">{p.story.title}</h2>
                                            <p className="mt-1.5 line-clamp-3 text-sm text-pretty text-navy/75">{p.story.excerpt}</p>
                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                <Badge variant={p.story.is_verified ? 'teal' : 'gold'}>
                                                    {p.story.is_verified ? 'Terverifikasi' : 'Belum diverifikasi'}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">Diperbarui {timeAgo(p.story.updated_at)}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="mt-1 text-sm text-pretty text-muted-foreground">
                                            Belum ada cerita. Pembeli lebih tertarik pada produk yang punya kisah.
                                        </p>
                                    )}
                                    <div className="mt-auto pt-4">
                                        <Button asChild variant={p.story ? 'outline' : 'default'} size="sm" className="w-full">
                                            <Link href={`/seller/cerita/${p.slug}`}>
                                                {p.story ? <PenLine /> : <Plus />}
                                                {p.story ? 'Ubah cerita' : 'Tulis cerita'}
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <Pagination paginator={products} className="mt-6" />
                </>
            )}
        </>
    );
}
