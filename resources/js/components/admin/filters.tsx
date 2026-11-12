import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type Query = Record<string, string | number | boolean | null | undefined>;

/** Kirim ulang filter ke URL saat ini (query string bersih dari nilai kosong). */
export function applyFilters(path: string, query: Query) {
    const clean: Record<string, string | number> = {};

    Object.entries(query).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '' || value === false) {
            return;
        }

        clean[key] = value === true ? 1 : value;
    });

    router.get(path, clean, { preserveState: true, preserveScroll: true, replace: true });
}

/** Tab status berbentuk pil yang bisa digulir horizontal di layar kecil. */
export function StatusTabs({
    items,
    value,
    onChange,
    label = 'Filter status',
}: {
    items: { value: string | null; label: string; count?: number }[];
    value: string | null;
    onChange: (value: string | null) => void;
    label?: string;
}) {
    return (
        <div
            role="tablist"
            aria-label={label}
            className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0"
        >
            {items.map((item) => {
                const active = item.value === value;

                return (
                    <button
                        key={item.value ?? 'all'}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(item.value)}
                        className={cn(
                            'inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[0.8125rem] font-semibold transition-colors',
                            active
                                ? 'border-navy bg-navy text-cream'
                                : 'border-border bg-card text-navy hover:bg-accent',
                        )}
                    >
                        {item.label}
                        {item.count !== undefined && (
                            <span
                                className={cn(
                                    'rounded-full px-1.5 text-[0.7rem] leading-5',
                                    active ? 'bg-cream/15 text-cream' : 'bg-cream-200 text-navy-700',
                                )}
                            >
                                {item.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

/** Kotak pencarian untuk tabel admin; dikirim saat Enter. */
export function SearchBox({
    initial,
    onSearch,
    placeholder = 'Cari…',
    className,
}: {
    initial: string;
    onSearch: (value: string) => void;
    placeholder?: string;
    className?: string;
}) {
    const [value, setValue] = useState(initial);

    return (
        <form
            role="search"
            className={cn('relative w-full sm:max-w-xs', className)}
            onSubmit={(e) => {
                e.preventDefault();
                onSearch(value.trim());
            }}
        >
            <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.75}
            />
            <input
                type="search"
                value={value}
                aria-label={placeholder}
                placeholder={placeholder}
                onChange={(e) => setValue(e.target.value)}
                enterKeyHint="search"
                className="h-10 w-full rounded-lg border border-input bg-[#faf6f0] pr-9 pl-9 text-sm outline-none placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20 [&::-webkit-search-cancel-button]:hidden"
            />
            {value && (
                <button
                    type="button"
                    aria-label="Hapus pencarian"
                    onClick={() => {
                        setValue('');
                        onSearch('');
                    }}
                    className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
                >
                    <X className="size-4" />
                </button>
            )}
        </form>
    );
}

/** Select native bergaya brand — ringan dan nyaman di perangkat sentuh. */
export function NativeSelect({
    className,
    children,
    ...props
}: React.ComponentProps<'select'>) {
    return (
        <select
            {...props}
            className={cn(
                'h-10 w-full rounded-lg border border-input bg-[#faf6f0] px-3 pr-8 text-sm text-navy outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20 sm:w-auto',
                className,
            )}
        >
            {children}
        </select>
    );
}
