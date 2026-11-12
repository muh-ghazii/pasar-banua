import { Head } from '@inertiajs/react';
import { BookOpenText, Info } from 'lucide-react';
import EmptyState from '@/components/shared/empty-state';
import Pagination from '@/components/shared/pagination';
import StoryCard from '@/components/shop/story-card';
import type { Paginated } from '@/types/domain';
import type { StoryCardData } from '@/types/shop';

export default function Stories({ stories }: { stories: Paginated<StoryCardData> }) {
    const [first, ...rest] = stories.data;
    const showFeature = stories.current_page === 1 && first;

    return (
        <>
            <Head title="Cerita Banua" />
            <section className="bg-navy text-cream">
                <div className="container-page py-12 lg:py-16">
                    <p className="eyebrow mb-3 text-gold">Cerita Banua</p>
                    <h1 className="max-w-3xl font-heading text-3xl leading-tight font-extrabold text-balance sm:text-5xl">
                        Bahan, tangan, dan tradisi di balik produk lokal
                    </h1>
                    <p className="mt-4 max-w-2xl text-[0.97rem] leading-relaxed text-pretty text-cream/75">
                        Kumpulan cerita produk dari UMKM Kalimantan Selatan: dari mana bahannya, bagaimana dibuat, dan mengapa ia berarti bagi pembuatnya.
                    </p>
                    <p className="mt-6 inline-flex max-w-2xl items-start gap-2 rounded-lg bg-navy-800 px-3.5 py-2.5 text-xs text-cream/70">
                        <Info className="mt-px size-4 shrink-0 text-gold" />
                        Cerita berlabel “Konten contoh” ditulis untuk demonstrasi dan belum diverifikasi sebagai fakta sejarah atau budaya.
                    </p>
                </div>
                <div className="motif-wave h-4 opacity-60" aria-hidden="true" />
            </section>

            <div className="container-page py-10 lg:py-14">
                {stories.data.length === 0 ? (
                    <EmptyState icon={BookOpenText} title="Belum ada cerita" description="Cerita produk akan tampil setelah produknya tayang." />
                ) : (
                    <>
                        {showFeature && <StoryCard story={first} variant="feature" className="mb-12 lg:grid lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-10" />}
                        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                            {(showFeature ? rest : stories.data).map((s) => (
                                <StoryCard key={s.id} story={s} />
                            ))}
                        </div>
                        <Pagination paginator={stories} className="mt-12" />
                    </>
                )}
            </div>
        </>
    );
}
