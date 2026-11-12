import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import * as React from 'react';

import { cn } from '@/lib/utils';

function RadioGroup({
    className,
    ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
    return (
        <RadioGroupPrimitive.Root
            data-slot="radio-group"
            className={cn('grid gap-2', className)}
            {...props}
        />
    );
}

function RadioGroupItem({
    className,
    ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
    return (
        <RadioGroupPrimitive.Item
            data-slot="radio-group-item"
            className={cn(
                'aspect-square size-5 shrink-0 rounded-full border border-input bg-[#faf6f0] text-primary outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary',
                className,
            )}
            {...props}
        >
            <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                <span className="size-2.5 rounded-full bg-primary" />
            </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
    );
}

export { RadioGroup, RadioGroupItem };
