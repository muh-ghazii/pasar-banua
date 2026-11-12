import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Hammer, Leaf, MapPin, ScrollText } from 'lucide-react';
import ProductImage from '@/components/brand/product-visual';
import ProductCard from '@/components/shop/product-card';
import { StoryVerificationNote } from '@/components/shop/story-card';
import { Button } from '@/components/ui/button';
import type { ProductCardData } from '@/types/domain';
import type { StoryDetail } from '@/types/shop';

type Props = {
    story: StoryDetail;
    product: ProductCardData;
    umkm: { name: string; slug: string; city: string; tagline: string | null };
};

export default function Story({ story, product, umkm }: Props) {
    const notes = [
        { icon: Hammer, title: 'Proses pembuatan', text: story.process_note },
        { icon: Leaf, title: 'Bahan', text: story.material_note },
        { icon: ScrollText, title: 'Nilai budaya', text: story.cultural_note },
    ].filter((n) => n.text);

    return (
        <>
            <Head title={story.title} />
            <article>
                <header className="container-page max-w-4xl pt-8 lg:pt-12">
                    <Link href="/cerita-banua" className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:underline">
                        <ArrowLeft className="size-4" />
                        Cerita Banua
                    </Link>
                    <div className="mt-6 flex flex-wrap items-center gap-2">
                        <p className="eyebrow text-gold-700">{product.category?.name}</p>
                        <StoryVerificationNote verified={story.is_verified} />
                    </div>
                    <h1 className="mt-3 font-heading text-3xl leading-[1.12] font-extrabold text-balance text-navy sm:text-5xl">
                        {story.title}
                    </h1>
                    <p className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
                        Oleh{' '}
                        <Link href={`/umkm/${umkm.slug}`} className="font-semibold text-navy hover:text-teal">
                            {umkm.name}
                        </Link>
                        <span aria-hidden="true">·</span>
                        <MapPin className="size-3.5" />
                        {umkm.city}
                    </p>
                </header>

                <div className="container-page mt-8 max-w-5xl">
                    <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-cream-200">
                        <ProductImage src={product.image_url} alt={product.image_alt} name={product.name} categorySlug={product.category?.slug} priority label={false} />
                    </div>
                </div>

                <div className="container-page mt-10 grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-14">
                    <div className="min-w-0">
                        <div className="text-[1.05rem] leading-[1.8] text-pretty whitespace-pre-line text-navy-700 first-letter:float-left first-letter:mr-2 first-letter:font-heading first-letter:text-5xl first-letter:leading-none first-letter:font-extrabold first-letter:text-teal">
                            {story.body}
                        </div>

                        {notes.length > 0 && (
                            <div className="mt-10 grid gap-4">
                                {notes.map((n) => (
                                    <section key={n.title} className="rounded-2xl border-l-4 border-gold bg-ivory p-5">
                                        <h2 className="flex items-center gap-2 font-heading text-base font-bold text-navy">
                                            <n.icon className="size-4 text-gold-700" strokeWidth={1.75} />
                                            {n.title}
                                        </h2>
                                        <p className="mt-2 text-sm leading-relaxed text-pretty text-navy-700">{n.text}</p>
                                    </section>
                                ))}
                            </div>
                        )}

                        {!story.is_verified && (
                            <p className="mt-8 rounded-xl bg-gold-100/70 px-4 py-3 text-xs leading-relaxed text-gold-700">
                                Catatan redaksi: cerita ini adalah konten contoh yang ditulis penjual dan belum diverifikasi kurator Pasar Banua.
                                Jangan jadikan rujukan sejarah atau budaya.
                            </p>
                        )}
                    </div>

                    <aside className="lg:sticky lg:top-24 lg:self-start">
                        <p className="eyebrow mb-3 text-teal">Produk dalam cerita</p>
                        <ProductCard product={product} />
                        <Button asChild variant="navy" className="mt-5 w-full">
                            <Link href={`/umkm/${umkm.slug}`}>Kunjungi {umkm.name}</Link>
                        </Button>
                    </aside>
                </div>
            </article>
        </>
    );
}
