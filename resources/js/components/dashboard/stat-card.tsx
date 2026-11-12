import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tone = 'teal' | 'gold' | 'brick' | 'navy';

const tones: Record<Tone, string> = {
    teal: 'bg-teal-50 text-teal',
    gold: 'bg-gold-100 text-gold-700',
    brick: 'bg-brick-100 text-brick',
    navy: 'bg-[#dfe5ee] text-navy',
};

export default function StatCard({
    label,
    value,
    hint,
    icon: Icon,
    tone = 'teal',
    badge,
    className,
}: {
    label: string;
    value: React.ReactNode;
    hint?: React.ReactNode;
    icon?: LucideIcon;
    tone?: Tone;
    badge?: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-5 shadow-soft',
                className,
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <p className="text-[0.8125rem] font-semibold text-muted-foreground">
                    {label}
                </p>
                <div className="flex items-center gap-2">
                    {badge}
                    {Icon && (
                        <span
                            className={cn(
                                'flex size-9 items-center justify-center rounded-lg',
                                tones[tone],
                            )}
                        >
                            <Icon className="size-[18px]" strokeWidth={1.75} />
                        </span>
                    )}
                </div>
            </div>
            <p className="font-heading text-[1.75rem] leading-none font-extrabold tracking-tight text-navy">
                {value}
            </p>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
    );
}
