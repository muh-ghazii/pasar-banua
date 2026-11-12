import { cn } from '@/lib/utils';

/** Tanda merek: atap bubungan tinggi + garis gelombang sungai. */
export function LogoMark({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 64 64"
            aria-hidden="true"
            className={cn('size-9 shrink-0', className)}
        >
            <rect width="64" height="64" rx="14" className="fill-navy" />
            <path
                d="M10 33 L32 13 L54 33"
                fill="none"
                stroke="#F2E9DE"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M14 46 Q 20 38 26 46 T 38 46 T 50 46"
                fill="none"
                stroke="#C5872A"
                strokeWidth="4.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

export default function Logo({
    tone = 'dark',
    className,
    compact = false,
}: {
    tone?: 'dark' | 'light';
    className?: string;
    compact?: boolean;
}) {
    const light = tone === 'light';

    return (
        <span className={cn('inline-flex items-center gap-2.5', className)}>
            <span
                className={cn(
                    'rounded-[10px]',
                    light && 'ring-1 ring-cream/25',
                )}
            >
                <LogoMark className="size-9" />
            </span>
            {!compact && (
                <span
                    className={cn(
                        'font-heading text-[1.15rem] leading-none font-extrabold tracking-tight',
                        light ? 'text-cream' : 'text-navy',
                    )}
                >
                    Pasar{' '}
                    <span className={light ? 'text-gold' : 'text-teal'}>
                        Banua
                    </span>
                </span>
            )}
        </span>
    );
}
