import { Link, usePage } from '@inertiajs/react';
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import Logo from '@/components/brand/logo';

export default function SiteFooter() {
    const { app, navCategories } = usePage().props;

    const columns = [
        {
            title: 'Jelajahi',
            links: [
                { label: 'Semua produk', href: '/produk' },
                ...navCategories.slice(0, 4).map((c) => ({ label: c.name, href: `/produk?kategori=${c.slug}` })),
                { label: 'Cerita Banua', href: '/cerita-banua' },
            ],
        },
        {
            title: 'Pasar Banua',
            links: [
                { label: 'Kenali Pasar Banua', href: '/tentang' },
                { label: 'UMKM Lokal', href: '/umkm' },
                { label: 'Gabung sebagai UMKM', href: '/register?sebagai=umkm' },
                { label: 'Kredit foto', href: '/tentang#kredit-foto' },
            ],
        },
    ];

    const social = [
        { label: 'Instagram', href: app.social.instagram, icon: Instagram },
        { label: 'Facebook', href: app.social.facebook, icon: Facebook },
        { label: 'YouTube', href: app.social.youtube, icon: Youtube },
    ];

    return (
        <footer className="mt-16 bg-navy text-cream/85 lg:mt-24">
            <div className="motif-wave h-4 w-full opacity-70" aria-hidden="true" />
            <div className="container-page grid gap-10 py-12 md:grid-cols-12 lg:py-16">
                <div className="md:col-span-5">
                    <Logo tone="light" />
                    <p className="mt-5 max-w-sm text-sm leading-relaxed text-pretty text-cream/75">
                        Marketplace terkurasi untuk kuliner dan kerajinan khas Kalimantan Selatan. Kami membantu
                        UMKM lokal bertemu pembeli, sambil menceritakan karya di balik setiap produk.
                    </p>
                    <ul className="mt-6 flex gap-2">
                        {social.map((s) => (
                            <li key={s.label}>
                                <a
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={s.label}
                                    className="flex size-10 items-center justify-center rounded-lg border border-cream/20 text-cream transition-colors hover:border-gold hover:text-gold"
                                >
                                    <s.icon className="size-[18px]" strokeWidth={1.75} />
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {columns.map((col) => (
                    <div key={col.title} className="md:col-span-2">
                        <h2 className="eyebrow text-gold">{col.title}</h2>
                        <ul className="mt-4 grid gap-2.5 text-sm">
                            {col.links.map((l) => (
                                <li key={l.label}>
                                    <Link href={l.href} className="text-cream/80 transition-colors hover:text-gold">
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                <div className="md:col-span-3">
                    <h2 className="eyebrow text-gold">Kontak</h2>
                    <ul className="mt-4 grid gap-3 text-sm">
                        <li className="flex items-start gap-2.5">
                            <Mail className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.75} />
                            <a href={`mailto:${app.contact.email}`} className="break-all hover:text-gold">
                                {app.contact.email}
                            </a>
                        </li>
                        <li className="flex items-start gap-2.5">
                            <Phone className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.75} />
                            <span>{app.contact.phone}</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                            <MapPin className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.75} />
                            <span>{app.contact.address}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-cream/10">
                <div className="container-page flex flex-col gap-2 py-5 text-xs text-cream/60 sm:flex-row sm:items-center sm:justify-between">
                    <p>© {new Date().getFullYear()} Pasar Banua. Proyek Manajemen Proyek TI — Teknologi Informasi ULM.</p>
                    {app.demo && <p>Mode demo: data dan transaksi pada situs ini adalah simulasi.</p>}
                </div>
            </div>
        </footer>
    );
}
