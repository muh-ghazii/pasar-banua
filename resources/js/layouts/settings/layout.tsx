import { Link, usePage } from '@inertiajs/react';
import { KeyRound, Receipt, UserRound } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { auth } = usePage().props;

    const items = [
        { title: 'Profil', href: '/settings/profile', icon: UserRound },
        { title: 'Keamanan', href: '/settings/security', icon: KeyRound },
        { title: 'Pesanan saya', href: '/akun/pesanan', icon: Receipt },
    ];

    return (
        <div className="container-page py-8 lg:py-12">
            <div className="mb-8">
                <p className="eyebrow mb-2 text-teal">Akun</p>
                <h1 className="font-heading text-3xl font-extrabold text-navy">Pengaturan akun</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Masuk sebagai {auth.user?.email} · {auth.user?.role_label}
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12">
                <nav aria-label="Pengaturan" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
                    {items.map((item) => {
                        const active = isCurrentOrParentUrl(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                    'inline-flex h-11 shrink-0 items-center gap-2.5 rounded-lg px-3.5 text-sm font-semibold transition-colors',
                                    active ? 'bg-navy text-cream' : 'text-navy hover:bg-accent',
                                )}
                            >
                                <item.icon className="size-4" strokeWidth={1.75} />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>

                <div className="max-w-xl space-y-10">{children}</div>
            </div>
        </div>
    );
}
