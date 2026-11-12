import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

export type FilterPill = {
    label: string;
    href: string;
    active: boolean;
    count?: number;
};

/** Deretan filter berbentuk pil yang dapat digeser di layar kecil. */
export default function FilterPills({
    items,
    className,
    label = 'Filter',
}: {
    items: FilterPill[];
    className?: string;
    label?: string;
}) {
    return (
        <nav
            aria-label={label}
            className={cn('no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0', className)}
        >
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    preserveScroll
                    preserveState
                    aria-current={item.active ? 'page' : undefined}
                    className={cn(
                        'inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[0.8125rem] font-semibold transition-colors',
                        item.active
                            ? 'border-navy bg-navy text-cream'
                            : 'border-border bg-card text-navy hover:border-input hover:bg-accent',
                    )}
                >
                    {item.label}
                    {item.count !== undefined && (
                        <span
                            className={cn(
                                'rounded-full px-1.5 text-[0.7rem] leading-5',
                                item.active ? 'bg-cream/15 text-cream' : 'bg-cream-200 text-muted-foreground',
                            )}
                        >
                            {item.count}
                        </span>
                    )}
                </Link>
            ))}
        </nav>
    );
}

/** Bangun URL dengan query string, mengabaikan nilai kosong. */
export function withQuery(path: string, params: Record<string, string | number | null | undefined>): string {
    const search = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            search.set(key, String(value));
        }
    });

    const qs = search.toString();

    return qs ? `${path}?${qs}` : path;
}
