import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
    return (
        <textarea
            data-slot="textarea"
            className={cn(
                'flex min-h-24 w-full rounded-lg border border-input bg-[#faf6f0] px-3.5 py-2.5 text-[0.9375rem] text-foreground transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-destructive/15 md:text-sm',
                className,
            )}
            {...props}
        />
    );
}

export { Textarea };
