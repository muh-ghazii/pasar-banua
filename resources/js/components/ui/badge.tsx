import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border px-2 py-0.5 text-xs font-semibold whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3',
    {
        variants: {
            variant: {
                default: 'border-transparent bg-teal text-ivory',
                navy: 'border-transparent bg-navy text-cream',
                gold: 'border-transparent bg-gold-100 text-gold-700',
                brick: 'border-transparent bg-brick-100 text-brick',
                teal: 'border-transparent bg-teal-100 text-teal-700',
                neutral: 'border-transparent bg-cream-200 text-navy-700',
                outline: 'border-border bg-transparent text-foreground',
                secondary: 'border-transparent bg-secondary text-secondary-foreground',
                destructive: 'border-transparent bg-brick text-ivory',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

function Badge({
    className,
    variant,
    asChild = false,
    ...props
}: React.ComponentProps<'span'> &
    VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : 'span';

    return (
        <Comp
            data-slot="badge"
            className={cn(badgeVariants({ variant }), className)}
            {...props}
        />
    );
}

export { Badge, badgeVariants };
