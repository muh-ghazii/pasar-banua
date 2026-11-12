import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types/domain';

/** Paginasi berbasis Inertia Link; mempertahankan query string. */
export default function Pagination({
    paginator,
    className,
    only,
}: {
    paginator: Pick<Paginated<unknown>, 'links' | 'last_page' | 'from' | 'to' | 'total'>;
    className?: string;
    only?: string[];
}) {
    if (paginator.last_page <= 1) {
        return null;
    }

    const links = paginator.links;
    const prev = links[0];
    const next = links[links.length - 1];
    const pages = links.slice(1, -1);

    const itemClass = (active: boolean, disabled = false) =>
        cn(
            'inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors',
            active
                ? 'bg-navy text-cream'
                : 'text-navy hover:bg-accent',
            disabled && 'pointer-events-none opacity-40',
        );

    return (
        <nav
            aria-label="Paginasi"
            className={cn(
                'flex flex-col items-center justify-between gap-3 sm:flex-row',
                className,
            )}
        >
            <p className="text-sm text-muted-foreground">
                Menampilkan {paginator.from}–{paginator.to} dari {paginator.total}
            </p>
            <div className="flex items-center gap-1">
                <Link
                    href={prev.url ?? '#'}
                    preserveScroll
                    only={only}
                    aria-label="Halaman sebelumnya"
                    className={itemClass(false, !prev.url)}
                >
                    <ChevronLeft className="size-4" />
                </Link>
                {pages.map((page, index) =>
                    page.url ? (
                        <Link
                            key={`${page.label}-${index}`}
                            href={page.url}
                            preserveScroll
                            only={only}
                            aria-current={page.active ? 'page' : undefined}
                            className={cn(
                                itemClass(page.active),
                                !page.active && 'hidden sm:inline-flex',
                            )}
                        >
                            {page.label}
                        </Link>
                    ) : (
                        <span
                            key={`${page.label}-${index}`}
                            className="px-1 text-muted-foreground"
                        >
                            …
                        </span>
                    ),
                )}
                <Link
                    href={next.url ?? '#'}
                    preserveScroll
                    only={only}
                    aria-label="Halaman berikutnya"
                    className={itemClass(false, !next.url)}
                >
                    <ChevronRight className="size-4" />
                </Link>
            </div>
        </nav>
    );
}
