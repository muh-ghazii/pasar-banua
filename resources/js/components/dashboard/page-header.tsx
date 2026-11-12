import { cn } from '@/lib/utils';

export default function PageHeader({
    title,
    description,
    actions,
    eyebrow,
    className,
}: {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    eyebrow?: string;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
                className,
            )}
        >
            <div className="min-w-0">
                {eyebrow && (
                    <p className="eyebrow mb-1.5 text-teal">{eyebrow}</p>
                )}
                <h1 className="font-heading text-2xl font-extrabold text-navy sm:text-[1.75rem]">
                    {title}
                </h1>
                {description && (
                    <p className="mt-1 max-w-2xl text-sm text-pretty text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
}
