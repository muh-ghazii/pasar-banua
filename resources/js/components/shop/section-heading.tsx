import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Judul section editorial: eyebrow kecil, judul besar, tautan "lihat semua" opsional. */
export default function SectionHeading({
    eyebrow,
    title,
    description,
    href,
    linkLabel = 'Lihat semua',
    tone = 'dark',
    className,
}: {
    eyebrow?: string;
    title: string;
    description?: string;
    href?: string;
    linkLabel?: string;
    tone?: 'dark' | 'light';
    className?: string;
}) {
    const light = tone === 'light';

    return (
        <div
            className={cn(
                'mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between',
                className,
            )}
        >
            <div className="max-w-2xl">
                {eyebrow && (
                    <p
                        className={cn(
                            'eyebrow mb-2.5',
                            light ? 'text-gold' : 'text-teal',
                        )}
                    >
                        {eyebrow}
                    </p>
                )}
                <h2
                    className={cn(
                        'font-heading text-[1.65rem] leading-[1.15] font-extrabold text-balance sm:text-[2.1rem]',
                        light ? 'text-cream' : 'text-navy',
                    )}
                >
                    {title}
                </h2>
                {description && (
                    <p
                        className={cn(
                            'mt-3 text-[0.95rem] leading-relaxed text-pretty',
                            light ? 'text-cream/75' : 'text-muted-foreground',
                        )}
                    >
                        {description}
                    </p>
                )}
            </div>
            {href && (
                <Link
                    href={href}
                    className={cn(
                        'group inline-flex shrink-0 items-center gap-1.5 text-sm font-bold',
                        light
                            ? 'text-gold hover:text-cream'
                            : 'text-teal hover:text-teal-700',
                    )}
                >
                    {linkLabel}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
            )}
        </div>
    );
}
