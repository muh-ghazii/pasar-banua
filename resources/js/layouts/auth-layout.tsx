import { Link } from '@inertiajs/react';
import { BadgeCheck, BookOpenText, Store } from 'lucide-react';
import Logo from '@/components/brand/logo';

const points = [
    { icon: BadgeCheck, text: 'UMKM dan produk dikurasi sebelum tampil' },
    { icon: BookOpenText, text: 'Cerita di balik setiap karya lokal' },
    { icon: Store, text: 'Dashboard sederhana untuk mengelola toko' },
];

export default function AuthLayout({
    title = '',
    description = '',
    children,
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="grid min-h-svh bg-background lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <aside className="relative hidden overflow-hidden bg-navy text-cream lg:block">
                <img
                    src="/images/hero.jpg"
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 size-full object-cover opacity-35"
                />
                <div className="absolute inset-0 bg-navy/70" />
                <div className="motif-wave absolute inset-x-0 bottom-0 h-4 opacity-70" aria-hidden="true" />
                <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
                    <Link href="/" aria-label="Kembali ke beranda">
                        <Logo tone="light" />
                    </Link>
                    <div>
                        <p className="eyebrow mb-4 text-gold">Marketplace terkurasi Kalimantan Selatan</p>
                        <h2 className="font-heading text-4xl leading-[1.1] font-extrabold text-balance xl:text-[2.75rem]">
                            Karya dan rasa Banua, langsung dari tangan pembuatnya.
                        </h2>
                        <ul className="mt-8 grid gap-4">
                            {points.map((p) => (
                                <li key={p.text} className="flex items-center gap-3 text-[0.95rem] text-cream/85">
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-cream/10 text-gold">
                                        <p.icon className="size-[18px]" strokeWidth={1.75} />
                                    </span>
                                    {p.text}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <p className="text-xs text-cream/55">
                        Foto: pasar terapung Banjarmasin, Wikimedia Commons (CC BY-SA 4.0)
                    </p>
                </div>
            </aside>

            <div className="flex flex-col px-5 py-8 sm:px-10">
                <div className="mb-8 flex items-center justify-between lg:hidden">
                    <Link href="/" aria-label="Kembali ke beranda">
                        <Logo />
                    </Link>
                </div>
                <div className="m-auto w-full max-w-[26rem]">
                    <div className="mb-8">
                        <h1 className="font-heading text-[1.75rem] leading-tight font-extrabold text-navy">
                            {title}
                        </h1>
                        {description && (
                            <p className="mt-2 text-sm text-pretty text-muted-foreground">{description}</p>
                        )}
                    </div>
                    {children}
                </div>
                <p className="mt-10 text-center text-xs text-muted-foreground">
                    <Link href="/" className="font-semibold text-teal hover:underline">
                        ← Kembali ke Pasar Banua
                    </Link>
                </p>
            </div>
        </div>
    );
}
