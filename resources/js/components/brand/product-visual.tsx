import { useId, useState } from 'react';
import { cn } from '@/lib/utils';
import { categoryIcon, categoryTone, defaultTone } from './category-icon';

function hash(input: string): number {
    let h = 0;

    for (let i = 0; i < input.length; i++) {
        h = (h * 31 + input.charCodeAt(i)) | 0;
    }

    return Math.abs(h);
}

/**
 * Visual cadangan yang dirancang (bukan gambar rusak) untuk produk tanpa foto.
 * Pola garis gelombang bervariasi per produk berdasarkan nama.
 */
export function ProductFallback({
    name,
    categorySlug,
    icon,
    className,
    label = true,
}: {
    name: string;
    categorySlug?: string | null;
    icon?: string | null;
    className?: string;
    label?: boolean;
}) {
    const id = useId().replace(/:/g, '');
    const tone = (categorySlug && categoryTone[categorySlug]) || defaultTone;
    const seed = hash(name);
    const Icon = categoryIcon(icon ?? undefined);
    const amplitude = 6 + (seed % 5);
    const rows = 8 + (seed % 4);
    const rotate = [-12, -6, 0, 8, 14][seed % 5];

    return (
        <div
            role="img"
            aria-label={`Ilustrasi ${name}`}
            className={cn(
                'relative isolate flex size-full items-center justify-center overflow-hidden',
                className,
            )}
            style={{ backgroundColor: tone.bg }}
        >
            <svg
                aria-hidden="true"
                className="absolute inset-0 size-full"
                preserveAspectRatio="xMidYMid slice"
            >
                <defs>
                    <pattern
                        id={id}
                        width="56"
                        height={100 / rows + 14}
                        patternUnits="userSpaceOnUse"
                        patternTransform={`rotate(${rotate})`}
                    >
                        <path
                            d={`M0 ${amplitude} Q 14 0 28 ${amplitude} T 56 ${amplitude}`}
                            fill="none"
                            stroke={tone.line}
                            strokeOpacity="0.28"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#${id})`} />
            </svg>
            <div className="relative flex flex-col items-center gap-2.5">
                <span
                    className="flex size-14 items-center justify-center rounded-full shadow-soft sm:size-16"
                    style={{ backgroundColor: tone.chip }}
                >
                    <Icon
                        className="size-6 sm:size-7"
                        strokeWidth={1.75}
                        style={{ color: tone.icon }}
                    />
                </span>
                {label && (
                    <span
                        className="rounded-full px-2.5 py-1 text-[0.65rem] font-bold tracking-wide uppercase"
                        style={{ backgroundColor: tone.chip, color: tone.icon }}
                    >
                        Foto segera hadir
                    </span>
                )}
            </div>
        </div>
    );
}

/**
 * Gambar produk dengan cadangan otomatis bila URL kosong atau gagal dimuat,
 * sehingga tidak pernah menampilkan gambar rusak.
 */
export default function ProductImage({
    src,
    alt,
    name,
    categorySlug,
    icon,
    className,
    imgClassName,
    label,
    priority = false,
}: {
    src: string | null | undefined;
    alt?: string;
    name: string;
    categorySlug?: string | null;
    icon?: string | null;
    className?: string;
    imgClassName?: string;
    label?: boolean;
    priority?: boolean;
}) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <ProductFallback
                name={name}
                categorySlug={categorySlug}
                icon={icon}
                className={className}
                label={label}
            />
        );
    }

    return (
        <img
            src={src}
            alt={alt ?? name}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => setFailed(true)}
            className={cn('size-full object-cover', className, imgClassName)}
        />
    );
}
