import { router, usePage } from '@inertiajs/react';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function NotificationBell({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
    const { notifications } = usePage().props;

    if (!notifications) {
        return null;
    }

    const open = (id: string) => {
        router.post(`/notifikasi/${id}/baca`, {}, { preserveScroll: true });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Notifikasi${notifications.unread ? `, ${notifications.unread} belum dibaca` : ''}`}
                    className={cn(
                        'relative',
                        tone === 'light' && 'text-cream hover:bg-cream/10',
                    )}
                >
                    <Bell className="size-5" strokeWidth={1.75} />
                    {notifications.unread > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex min-w-4 items-center justify-center rounded-full bg-brick px-1 text-[0.6rem] leading-4 font-bold text-white ring-2 ring-cream">
                            {notifications.unread > 9 ? '9+' : notifications.unread}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[min(22rem,calc(100vw-1.5rem))] p-0">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <p className="font-heading text-sm font-bold text-navy">Notifikasi</p>
                    {notifications.unread > 0 && (
                        <button
                            type="button"
                            onClick={() =>
                                router.post('/notifikasi/baca-semua', {}, { preserveScroll: true })
                            }
                            className="inline-flex items-center gap-1 text-xs font-semibold text-teal hover:underline"
                        >
                            <CheckCheck className="size-3.5" />
                            Tandai semua dibaca
                        </button>
                    )}
                </div>
                {notifications.items.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                        Belum ada notifikasi.
                    </p>
                ) : (
                    <ul className="max-h-80 overflow-y-auto">
                        {notifications.items.map((n) => (
                            <li key={n.id}>
                                <button
                                    type="button"
                                    onClick={() => open(n.id)}
                                    className={cn(
                                        'flex w-full gap-3 border-b border-border/60 px-4 py-3 text-left last:border-0 hover:bg-accent/60',
                                        !n.read && 'bg-teal-50/60',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'mt-1.5 size-2 shrink-0 rounded-full',
                                            n.read ? 'bg-transparent' : 'bg-teal',
                                        )}
                                    />
                                    <span className="min-w-0">
                                        <span className="block text-sm font-semibold text-navy">
                                            {n.title}
                                        </span>
                                        <span className="mt-0.5 block text-[0.8125rem] text-pretty text-muted-foreground">
                                            {n.message}
                                        </span>
                                        <span className="mt-1 block text-[0.7rem] text-muted-foreground/80">
                                            {timeAgo(n.created_at)}
                                        </span>
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
