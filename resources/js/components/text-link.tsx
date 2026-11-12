import { Link } from '@inertiajs/react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type Props = ComponentProps<typeof Link>;

export default function TextLink({ className = '', children, ...props }: Props) {
    return (
        <Link
            className={cn(
                'font-semibold text-teal underline decoration-teal/30 underline-offset-4 transition-colors hover:decoration-teal',
                className,
            )}
            {...props}
        >
            {children}
        </Link>
    );
}
