import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/** Label + kontrol + pesan error/bantuan dengan atribut aksesibilitas. */
export default function FormField({
    label,
    htmlFor,
    error,
    hint,
    required,
    className,
    children,
}: {
    label: string;
    htmlFor: string;
    error?: string;
    hint?: string;
    required?: boolean;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={cn('grid gap-1.5', className)}>
            <Label htmlFor={htmlFor} className="text-[0.8125rem] font-semibold text-navy">
                {label}
                {required && <span className="ml-0.5 text-brick">*</span>}
            </Label>
            {children}
            {hint && !error && (
                <p className="text-xs text-muted-foreground">{hint}</p>
            )}
            {error && (
                <p role="alert" className="text-xs font-medium text-brick">
                    {error}
                </p>
            )}
        </div>
    );
}
