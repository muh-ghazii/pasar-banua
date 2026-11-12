import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform] duration-150 outline-none select-none focus-visible:ring-[3px] focus-visible:ring-ring/35 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    {
        variants: {
            variant: {
                default:
                    'bg-primary text-primary-foreground shadow-soft hover:bg-teal-700',
                navy: 'bg-navy text-cream shadow-soft hover:bg-navy-800',
                gold: 'bg-gold text-navy shadow-soft hover:bg-[#d5972f]',
                destructive:
                    'bg-destructive text-destructive-foreground hover:bg-[#7d1f27]',
                outline:
                    'border border-input bg-transparent text-foreground hover:bg-accent',
                secondary:
                    'bg-secondary text-secondary-foreground hover:bg-cream-300',
                ghost: 'text-foreground hover:bg-accent',
                link: 'text-primary underline-offset-4 hover:underline',
                'outline-light':
                    'border border-cream/40 bg-transparent text-cream hover:bg-cream/10',
            },
            size: {
                default: 'h-10 px-4 has-[>svg]:px-3.5',
                sm: 'h-9 px-3 text-[0.8125rem] has-[>svg]:px-2.5',
                xs: 'h-7 gap-1 rounded-md px-2.5 text-xs',
                lg: 'h-12 rounded-xl px-6 text-[0.95rem] has-[>svg]:px-5',
                icon: 'size-10',
                'icon-sm': 'size-9',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

function Button({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            data-slot="button"
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Button, buttonVariants };
