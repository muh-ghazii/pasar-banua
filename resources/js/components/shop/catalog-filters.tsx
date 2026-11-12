import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { CatalogFilters } from '@/types/shop';

export type FilterOptions = {
    categories: { name: string; slug: string; products_count: number }[];
    cities: string[];
    priceRange: { min: number; max: number };
};

type Patch = Partial<Omit<CatalogFilters, 'urut' | 'q'>>;

function Group({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <fieldset className="border-b border-border py-5 first:pt-0 last:border-0">
            <legend className="mb-3 font-heading text-sm font-bold text-navy">
                {title}
            </legend>
            {children}
        </fieldset>
    );
}

function OptionButton({
    active,
    onClick,
    children,
    count,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
    count?: number;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={cn(
                'flex h-10 w-full items-center justify-between gap-2 rounded-lg px-3 text-left text-sm transition-colors',
                active
                    ? 'bg-navy font-semibold text-cream'
                    : 'text-navy hover:bg-accent',
            )}
        >
            <span className="truncate">{children}</span>
            {count !== undefined && (
                <span
                    className={cn(
                        'text-xs',
                        active ? 'text-cream/70' : 'text-muted-foreground',
                    )}
                >
                    {count}
                </span>
            )}
        </button>
    );
}

/**
 * Panel filter katalog. Dipakai di sidebar desktop dan di bottom sheet mobile.
 * Setiap perubahan langsung diterapkan lewat `onApply` (query string di URL).
 */
export default function CatalogFilterPanel({
    filters,
    options,
    onApply,
}: {
    filters: CatalogFilters;
    options: FilterOptions;
    onApply: (patch: Patch) => void;
}) {
    const [min, setMin] = useState(filters.harga_min?.toString() ?? '');
    const [max, setMax] = useState(filters.harga_maks?.toString() ?? '');

    const toNumber = (v: string) => {
        const n = parseInt(v.replace(/\D/g, ''), 10);

        return Number.isNaN(n) ? null : n;
    };

    return (
        <div>
            <Group title="Kategori">
                <div className="grid gap-0.5">
                    <OptionButton
                        active={filters.kategori === ''}
                        onClick={() => onApply({ kategori: '' })}
                    >
                        Semua kategori
                    </OptionButton>
                    {options.categories.map((c) => (
                        <OptionButton
                            key={c.slug}
                            active={filters.kategori === c.slug}
                            count={c.products_count}
                            onClick={() => onApply({ kategori: c.slug })}
                        >
                            {c.name}
                        </OptionButton>
                    ))}
                </div>
            </Group>

            <Group title="Lokasi UMKM">
                <div className="grid gap-0.5">
                    <OptionButton
                        active={filters.kota === ''}
                        onClick={() => onApply({ kota: '' })}
                    >
                        Semua lokasi
                    </OptionButton>
                    {options.cities.map((city) => (
                        <OptionButton
                            key={city}
                            active={filters.kota === city}
                            onClick={() => onApply({ kota: city })}
                        >
                            {city}
                        </OptionButton>
                    ))}
                </div>
            </Group>

            <Group title="Rentang harga">
                <form
                    className="grid gap-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        onApply({ harga_min: toNumber(min), harga_maks: toNumber(max) });
                    }}
                >
                    <div className="grid grid-cols-2 gap-2">
                        <div className="grid gap-1">
                            <Label htmlFor="harga_min" className="text-xs text-muted-foreground">
                                Minimum
                            </Label>
                            <Input
                                id="harga_min"
                                inputMode="numeric"
                                placeholder={formatRupiah(options.priceRange.min)}
                                value={min}
                                onChange={(e) => setMin(e.target.value.replace(/\D/g, ''))}
                            />
                        </div>
                        <div className="grid gap-1">
                            <Label htmlFor="harga_maks" className="text-xs text-muted-foreground">
                                Maksimum
                            </Label>
                            <Input
                                id="harga_maks"
                                inputMode="numeric"
                                placeholder={formatRupiah(options.priceRange.max)}
                                value={max}
                                onChange={(e) => setMax(e.target.value.replace(/\D/g, ''))}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" variant="navy" size="sm" className="flex-1">
                            Terapkan harga
                        </Button>
                        {(filters.harga_min !== null || filters.harga_maks !== null) && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setMin('');
                                    setMax('');
                                    onApply({ harga_min: null, harga_maks: null });
                                }}
                            >
                                Reset
                            </Button>
                        )}
                    </div>
                </form>
            </Group>

            <Group title="Ketersediaan">
                <div className="flex items-center gap-2.5">
                    <Checkbox
                        id="tersedia"
                        checked={filters.tersedia}
                        onCheckedChange={(v) => onApply({ tersedia: v === true })}
                    />
                    <Label htmlFor="tersedia" className="text-sm font-normal text-navy">
                        Hanya tampilkan yang tersedia
                    </Label>
                </div>
            </Group>
        </div>
    );
}
