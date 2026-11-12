import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { useFlashToast } from '@/hooks/use-flash-toast';

function Toaster({ ...props }: ToasterProps) {
    useFlashToast();

    return (
        <Sonner
            theme="light"
            className="toaster group"
            position="top-center"
            offset={{ top: 16 }}
            mobileOffset={{ top: 12 }}
            toastOptions={{
                classNames: {
                    toast: '!rounded-xl !border-border !shadow-lift !font-sans',
                },
            }}
            style={
                {
                    '--normal-bg': 'var(--popover)',
                    '--normal-text': 'var(--popover-foreground)',
                    '--normal-border': 'var(--border)',
                    '--success-bg': '#E8F2F0',
                    '--success-text': '#054F52',
                    '--success-border': '#B9D8D5',
                    '--error-bg': '#F1D9D9',
                    '--error-text': '#7D1F27',
                    '--error-border': '#E2B6B8',
                } as React.CSSProperties
            }
            {...props}
        />
    );
}

export { Toaster };
