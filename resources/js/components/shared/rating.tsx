import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RatingStars({
    value,
    className,
    size = 'size-4',
}: {
    value: number;
    className?: string;
    size?: string;
}) {
    return (
        <span
            className={cn('inline-flex items-center gap-0.5', className)}
            role="img"
            aria-label={`Rating ${value.toFixed(1)} dari 5`}
        >
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={cn(
                        size,
                        i <= Math.round(value)
                            ? 'fill-gold text-gold'
                            : 'fill-transparent text-cream-300',
                    )}
                    strokeWidth={1.75}
                />
            ))}
        </span>
    );
}

/** Rating ringkas untuk kartu: ★ 4,8 (23) */
export function RatingInline({
    rating,
    count,
    className,
}: {
    rating: number | null;
    count: number;
    className?: string;
}) {
    if (rating === null || count === 0) {
        return (
            <span className={cn('text-xs text-muted-foreground', className)}>
                Belum ada ulasan
            </span>
        );
    }

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 text-xs font-semibold text-navy',
                className,
            )}
        >
            <Star className="size-3.5 fill-gold text-gold" strokeWidth={1.75} />
            {rating.toFixed(1).replace('.', ',')}
            <span className="font-normal text-muted-foreground">({count})</span>
        </span>
    );
}
