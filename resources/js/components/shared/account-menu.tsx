import { Link, router, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    LayoutDashboard,
    LogOut,
    Receipt,
    Settings,
    Store,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function AccountMenu({
    tone = 'dark',
    showName = true,
}: {
    tone?: 'dark' | 'light';
    showName?: boolean;
}) {
    const { auth } = usePage().props;
    const user = auth.user;

    if (!user) {
        return null;
    }

    const light = tone === 'light';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label="Menu akun"
                    className={cn(
                        'flex h-10 items-center gap-2 rounded-lg pr-2 pl-1 transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30',
                        light ? 'hover:bg-cream/10' : 'hover:bg-accent',
                    )}
                >
                    <Avatar className="size-8">
                        <AvatarFallback className="bg-navy text-xs font-bold text-cream">
                            {initials(user.name)}
                        </AvatarFallback>
                    </Avatar>
                    {showName && (
                        <span
                            className={cn(
                                'hidden max-w-[8rem] truncate text-sm font-semibold lg:block',
                                light ? 'text-cream' : 'text-navy',
                            )}
                        >
                            {user.name.split(' ')[0]}
                        </span>
                    )}
                    <ChevronDown
                        className={cn(
                            'hidden size-4 lg:block',
                            light ? 'text-cream/70' : 'text-muted-foreground',
                        )}
                    />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="font-normal">
                    <p className="truncate text-sm font-bold text-navy">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    <p className="mt-1 text-[0.7rem] font-semibold text-teal">
                        {user.role_label}
                    </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role !== 'customer' && (
                    <DropdownMenuItem asChild>
                        <Link href={user.home_path} className="cursor-pointer">
                            <LayoutDashboard />
                            Dashboard
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                    <Link href="/akun/pesanan" className="cursor-pointer">
                        <Receipt />
                        Pesanan saya
                    </Link>
                </DropdownMenuItem>
                {user.role !== 'customer' && (
                    <DropdownMenuItem asChild>
                        <Link href="/" className="cursor-pointer">
                            <Store />
                            Lihat toko
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                    <Link href="/settings/profile" className="cursor-pointer">
                        <Settings />
                        Pengaturan akun
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="cursor-pointer text-brick focus:text-brick"
                    onSelect={() => router.post('/logout')}
                >
                    <LogOut className="text-brick" />
                    Keluar
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
