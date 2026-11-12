import { useId, useState } from 'react';
import { cn } from '@/lib/utils';
import type { TrendPoint } from '@/types/domain';

/**
 * Grafik batang ringan tanpa dependensi eksternal.
 * Menampilkan nilai saat disorot/fokus dan teks alternatif untuk pembaca layar.
 */
export function BarChart({
    data,
    format = (v) => String(v),
    height = 180,
    color = 'var(--color-teal)',
    className,
    labelEvery = 1,
}: {
    data: TrendPoint[];
    format?: (value: number) => string;
    height?: number;
    color?: string;
    className?: string;
    labelEvery?: number;
}) {
    const [active, setActive] = useState<number | null>(null);
    const max = Math.max(1, ...data.map((d) => d.value));
    const summary = data.map((d) => `${d.label}: ${format(d.value)}`).join(', ');

    return (
        <div className={cn('w-full', className)}>
            <p className="sr-only">{summary}</p>
            <div
                className="relative flex items-end gap-1 sm:gap-1.5"
                style={{ height }}
                aria-hidden="true"
            >
                {[0.25, 0.5, 0.75, 1].map((g) => (
                    <div
                        key={g}
                        className="pointer-events-none absolute inset-x-0 border-t border-dashed border-border"
                        style={{ bottom: `${g * 100}%` }}
                    />
                ))}
                {data.map((d, i) => {
                    const h = Math.max(d.value > 0 ? 4 : 0, (d.value / max) * 100);

                    return (
                        <div
                            key={`${d.label}-${i}`}
                            className="relative flex h-full min-w-0 flex-1 items-end"
                            onMouseEnter={() => setActive(i)}
                            onMouseLeave={() => setActive(null)}
                        >
                            {active === i && (
                                <div className="absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 rounded-md bg-navy px-2 py-1 text-[0.7rem] font-semibold whitespace-nowrap text-cream shadow-lift">
                                    {d.label} · {format(d.value)}
                                </div>
                            )}
                            <div
                                className="w-full rounded-t-[4px] transition-opacity"
                                style={{
                                    height: `${h}%`,
                                    background: color,
                                    opacity: active === null || active === i ? 1 : 0.45,
                                }}
                            />
                        </div>
                    );
                })}
            </div>
            <div className="mt-2 flex gap-1 sm:gap-1.5" aria-hidden="true">
                {data.map((d, i) => (
                    <span
                        key={`${d.label}-l-${i}`}
                        className="min-w-0 flex-1 truncate text-center text-[0.65rem] text-muted-foreground"
                    >
                        {i % labelEvery === 0 ? d.label : ''}
                    </span>
                ))}
            </div>
        </div>
    );
}

/** Grafik garis/area sederhana untuk tren. */
export function LineChart({
    data,
    format = (v) => String(v),
    height = 180,
    color = 'var(--color-teal)',
    className,
}: {
    data: TrendPoint[];
    format?: (value: number) => string;
    height?: number;
    color?: string;
    className?: string;
}) {
    const id = useId().replace(/:/g, '');
    const [active, setActive] = useState<number | null>(null);
    const width = 600;
    const pad = 8;
    const max = Math.max(1, ...data.map((d) => d.value));
    const stepX = data.length > 1 ? (width - pad * 2) / (data.length - 1) : 0;
    const points = data.map((d, i) => ({
        x: pad + i * stepX,
        y: pad + (1 - d.value / max) * (height - pad * 2),
    }));
    const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const area = points.length
        ? `${line} L${points[points.length - 1].x},${height - pad} L${points[0].x},${height - pad} Z`
        : '';
    const summary = data.map((d) => `${d.label}: ${format(d.value)}`).join(', ');

    return (
        <div className={cn('relative w-full', className)}>
            <p className="sr-only">{summary}</p>
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full"
                style={{ height }}
                preserveAspectRatio="none"
                aria-hidden="true"
                onMouseLeave={() => setActive(null)}
            >
                <defs>
                    <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.22" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                {[0.25, 0.5, 0.75, 1].map((g) => (
                    <line
                        key={g}
                        x1="0"
                        x2={width}
                        y1={pad + (1 - g) * (height - pad * 2)}
                        y2={pad + (1 - g) * (height - pad * 2)}
                        stroke="var(--color-border)"
                        strokeDasharray="3 4"
                    />
                ))}
                {area && <path d={area} fill={`url(#${id})`} />}
                <path
                    d={line}
                    fill="none"
                    stroke={color}
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                />
                {points.map((p, i) => (
                    <rect
                        key={i}
                        x={p.x - stepX / 2}
                        y={0}
                        width={Math.max(stepX, 12)}
                        height={height}
                        fill="transparent"
                        onMouseEnter={() => setActive(i)}
                    />
                ))}
                {active !== null && (
                    <circle
                        cx={points[active].x}
                        cy={points[active].y}
                        r="5"
                        fill={color}
                        stroke="#F5EFE7"
                        strokeWidth="2"
                    />
                )}
            </svg>
            {active !== null && (
                <div
                    className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-md bg-navy px-2 py-1 text-[0.7rem] font-semibold whitespace-nowrap text-cream shadow-lift"
                    style={{ left: `${(points[active].x / width) * 100}%` }}
                >
                    {data[active].label} · {format(data[active].value)}
                </div>
            )}
            <div className="mt-2 flex justify-between text-[0.65rem] text-muted-foreground" aria-hidden="true">
                <span>{data[0]?.label}</span>
                <span>{data[data.length - 1]?.label}</span>
            </div>
        </div>
    );
}
