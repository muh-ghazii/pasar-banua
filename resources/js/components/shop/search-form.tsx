import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/** Pencarian produk global. Mengirim ke katalog /produk?q=. */
export default function SearchForm({
    initial = '',
    className,
    autoFocus,
    onDone,
    placeholder = 'Cari amplang, sasirangan, anyaman…',
    id = 'global-search',
}: {
    initial?: string;
    className?: string;
    autoFocus?: boolean;
    onDone?: () => void;
    placeholder?: string;
    id?: string;
}) {
    const [value, setValue] = useState(initial);

    return (
        <form
            role="search"
            className={cn('relative', className)}
            onSubmit={(e) => {
                e.preventDefault();
                router.get('/produk', value.trim() ? { q: value.trim() } : {});
                onDone?.();
            }}
        >
            <label htmlFor={id} className="sr-only">
                Cari produk
            </label>
            <Search
                className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.75}
            />
            <input
                id={id}
                type="search"
                value={value}
                autoFocus={autoFocus}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                enterKeyHint="search"
                className="h-11 w-full rounded-full border border-input bg-[#faf6f0] pr-10 pl-11 text-sm text-foreground transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20 [&::-webkit-search-cancel-button]:hidden"
            />
            {value && (
                <button
                    type="button"
                    aria-label="Hapus pencarian"
                    onClick={() => setValue('')}
                    className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
                >
                    <X className="size-4" />
                </button>
            )}
        </form>
    );
}
