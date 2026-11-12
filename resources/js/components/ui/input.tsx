import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                'flex h-11 w-full min-w-0 rounded-lg border border-input bg-[#faf6f0] px-3.5 text-[0.9375rem] text-foreground shadow-none transition-[border-color,box-shadow] outline-none selection:bg-gold selection:text-navy file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-destructive/15 md:text-sm',
                className,
            )}
            {...props}
        />
    );
}

export { Input };
