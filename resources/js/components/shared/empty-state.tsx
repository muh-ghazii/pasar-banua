import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EmptyState({
    icon: Icon = Inbox,
    title,
    description,
    action,
    className,
}: {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center rounded-2xl border border-dashed border-input bg-card/60 px-6 py-14 text-center',
                className,
            )}
        >
            <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-teal-50 text-teal">
                <Icon className="size-6" strokeWidth={1.75} />
            </span>
            <h3 className="font-heading text-lg font-bold text-navy">{title}</h3>
            {description && (
                <p className="mt-1.5 max-w-sm text-sm text-pretty text-muted-foreground">
                    {description}
                </p>
            )}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}
