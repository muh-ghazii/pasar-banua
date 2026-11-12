import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Kolom pencarian untuk daftar di dashboard. Mempertahankan parameter lain
 * (mis. filter status) dan mereset halaman ke 1.
 */
export default function ListSearch({
    path,
    initial,
    params = {},
    placeholder = 'Cari…',
    className,
}: {
    path: string;
    initial: string;
    params?: Record<string, string>;
    placeholder?: string;
    className?: string;
}) {
    const [value, setValue] = useState(initial);

    const go = (q: string) => {
        const query: Record<string, string> = {};

        Object.entries({ ...params, q }).forEach(([k, v]) => {
            if (v) {
                query[k] = v;
            }
        });

        router.get(path, query, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <form
            role="search"
            className={cn('relative w-full sm:max-w-xs', className)}
            onSubmit={(e) => {
                e.preventDefault();
                go(value.trim());
            }}
        >
            <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.75}
            />
            <input
                type="search"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                aria-label={placeholder}
                enterKeyHint="search"
                className="h-10 w-full rounded-lg border border-input bg-[#faf6f0] pr-9 pl-9 text-sm outline-none placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20 [&::-webkit-search-cancel-button]:hidden"
            />
            {value && (
                <button
                    type="button"
                    aria-label="Hapus pencarian"
                    onClick={() => {
                        setValue('');
                        go('');
                    }}
                    className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
                >
                    <X className="size-4" />
                </button>
            )}
        </form>
    );
}
