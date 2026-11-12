import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import ProductImage from '@/components/brand/product-visual';
import { cn } from '@/lib/utils';
import type { StoryCardData } from '@/types/shop';

/** Label kejujuran konten: cerita yang belum diverifikasi kurator. */
export function StoryVerificationNote({
    verified,
    tone = 'dark',
    className,
}: {
    verified: boolean;
    tone?: 'dark' | 'light';
    className?: string;
}) {
    if (verified) {
        return (
            <span
                className={cn(
                    'inline-flex items-center rounded-md px-2 py-0.5 text-[0.65rem] font-bold tracking-wide uppercase',
                    tone === 'light'
                        ? 'bg-teal/80 text-ivory'
                        : 'bg-teal-100 text-teal-700',
                    className,
                )}
            >
                Diverifikasi kurator
            </span>
        );
    }

    return (
        <span
            title="Cerita ditulis sebagai contoh dan belum diverifikasi sebagai fakta sejarah atau budaya."
            className={cn(
                'inline-flex items-center rounded-md px-2 py-0.5 text-[0.65rem] font-bold tracking-wide uppercase',
                tone === 'light'
                    ? 'bg-gold/90 text-navy'
                    : 'bg-gold-100 text-gold-700',
                className,
            )}
        >
            Konten contoh
        </span>
    );
}

export default function StoryCard({
    story,
    variant = 'default',
    tone = 'dark',
    className,
}: {
    story: StoryCardData;
    variant?: 'default' | 'feature';
    tone?: 'dark' | 'light';
    className?: string;
}) {
    const light = tone === 'light';
    const feature = variant === 'feature';

    return (
        <Link
            href={`/cerita-banua/${story.product.slug}`}
            className={cn(
                'group flex flex-col gap-4',
                feature && 'lg:gap-5',
                className,
            )}
        >
            <div
                className={cn(
                    'relative overflow-hidden rounded-2xl bg-cream-200',
                    feature ? 'aspect-[4/3] lg:aspect-[16/11]' : 'aspect-[16/10]',
                )}
            >
                <ProductImage
                    src={story.product.image_url}
                    name={story.product.name}
                    categorySlug={story.product.category?.slug}
                    icon={story.product.category?.icon}
                    label={false}
                    className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <StoryVerificationNote
                    verified={story.is_verified}
                    tone="light"
                    className="absolute top-3 left-3"
                />
            </div>
            <div>
                <p
                    className={cn(
                        'text-xs font-semibold',
                        light ? 'text-gold' : 'text-gold-700',
                    )}
                >
                    {story.product.name}
                    {story.product.umkm ? ` · ${story.product.umkm}` : ''}
                </p>
                <h3
                    className={cn(
                        'mt-1.5 flex items-start gap-2 font-heading leading-snug font-bold text-balance',
                        feature ? 'text-xl lg:text-2xl' : 'text-lg',
                        light
                            ? 'text-cream group-hover:text-gold'
                            : 'text-navy group-hover:text-teal',
                    )}
                >
                    {story.title}
                    <ArrowUpRight className="mt-1 size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                </h3>
                <p
                    className={cn(
                        'mt-2 line-clamp-3 text-sm leading-relaxed text-pretty',
                        light ? 'text-cream/70' : 'text-muted-foreground',
                    )}
                >
                    {story.excerpt}
                </p>
            </div>
        </Link>
    );
}
