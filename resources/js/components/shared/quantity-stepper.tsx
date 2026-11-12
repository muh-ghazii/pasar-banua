import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function QuantityStepper({
    value,
    onChange,
    min = 1,
    max,
    disabled,
    size = 'md',
    className,
    label = 'Jumlah',
}: {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max: number;
    disabled?: boolean;
    size?: 'sm' | 'md';
    className?: string;
    label?: string;
}) {
    const clamp = (n: number) => Math.max(min, Math.min(max, n));
    const button = cn(
        'flex items-center justify-center text-navy transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40',
        size === 'sm' ? 'size-8' : 'size-10',
    );

    return (
        <div
            role="group"
            aria-label={label}
            className={cn(
                'inline-flex items-center overflow-hidden rounded-lg border border-input bg-[#faf6f0]',
                className,
            )}
        >
            <button
                type="button"
                aria-label="Kurangi jumlah"
                className={button}
                disabled={disabled || value <= min}
                onClick={() => onChange(clamp(value - 1))}
            >
                <Minus className="size-3.5" />
            </button>
            <input
                inputMode="numeric"
                aria-label={label}
                value={value}
                disabled={disabled}
                onChange={(e) => {
                    const n = parseInt(e.target.value.replace(/\D/g, ''), 10);
                    onChange(Number.isNaN(n) ? min : clamp(n));
                }}
                className={cn(
                    'bg-transparent text-center text-sm font-semibold text-navy outline-none',
                    size === 'sm' ? 'w-8' : 'w-11',
                )}
            />
            <button
                type="button"
                aria-label="Tambah jumlah"
                className={button}
                disabled={disabled || value >= max}
                onClick={() => onChange(clamp(value + 1))}
            >
                <Plus className="size-3.5" />
            </button>
        </div>
    );
}
