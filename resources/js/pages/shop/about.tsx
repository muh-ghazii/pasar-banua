import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, BookOpenText, GraduationCap, HandHeart, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Credit = {
    key: string;
    title: string;
    author: string;
    license: string;
    license_url: string;
    source_url: string;
    alt: string;
};

type Props = {
    credits: Credit[];
    stats: { umkm: number; products: number };
    targets: {
        active_umkm: number;
        transaction_growth_percent: number;
        transaction_growth_months: number;
        satisfaction_min: number;
    };
};

export default function About({ credits, stats, targets }: Props) {
    const pillars = [
        { icon: BadgeCheck, title: 'Kurasi', text: 'UMKM diverifikasi dan produk ditinjau sebelum tayang, agar pembeli bisa percaya pada apa yang mereka temukan.' },
        { icon: BookOpenText, title: 'Cerita', text: 'Setiap produk diberi ruang untuk menceritakan bahan, proses, dan orang di baliknya.' },
        { icon: GraduationCap, title: 'Pendampingan', text: 'Panduan dan pelatihan membantu pelaku UMKM mengelola katalog, stok, dan pesanan online.' },
        { icon: HandHeart, title: 'Keberpihakan lokal', text: 'Fokus pada produk dari Kalimantan Selatan, untuk memperluas pasar UMKM Banua.' },
    ];

    return (
        <>
            <Head title="Kenali Pasar Banua" />
            <section className="container-page grid gap-10 py-10 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-16">
                <div>
                    <p className="eyebrow mb-3 text-teal">Tentang kami</p>
                    <h1 className="font-heading text-3xl leading-tight font-extrabold text-balance text-navy sm:text-5xl">
                        Pasar untuk karya dan rasa dari tanah Banua
                    </h1>
                    <p className="mt-5 text-[1.02rem] leading-relaxed text-pretty text-navy-700">
                        Pasar Banua adalah marketplace terkurasi untuk produk kuliner dan kerajinan khas Kalimantan Selatan.
                        Kami membantu UMKM lokal menjangkau pembeli yang lebih luas, sekaligus memperkenalkan nilai di balik setiap produk.
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-pretty text-muted-foreground">
                        Pasar Banua dikembangkan sebagai proyek mata kuliah Manajemen Proyek TI, Program Studi Teknologi Informasi ULM.
                        Versi saat ini berjalan dalam mode demo: UMKM, produk, dan transaksi bersifat simulasi.
                    </p>
                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                        <Button asChild size="lg">
                            <Link href="/produk">
                                Jelajahi produk
                                <ArrowRight />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline">
                            <Link href="/register?sebagai=umkm">
                                <Store />
                                Gabung sebagai UMKM
                            </Link>
                        </Button>
                    </div>
                </div>
                <figure className="overflow-hidden rounded-2xl bg-navy">
                    <img src="/images/cerita/pasar-terapung.jpg" alt="Pemandangan udara ratusan jukung pedagang di pasar terapung" className="aspect-[4/3] w-full object-cover" />
                </figure>
            </section>

            <section className="border-y border-border bg-ivory/70">
                <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
                    {pillars.map((p) => (
                        <div key={p.title}>
                            <p.icon className="size-6 text-teal" strokeWidth={1.6} />
                            <h2 className="mt-3 font-heading text-lg font-bold text-navy">{p.title}</h2>
                            <p className="mt-1.5 text-sm leading-relaxed text-pretty text-muted-foreground">{p.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="container-page py-14">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-14">
                    <div>
                        <p className="eyebrow mb-2 text-teal">Target proyek</p>
                        <h2 className="font-heading text-2xl font-extrabold text-balance text-navy sm:text-3xl">Yang ingin kami capai</h2>
                        <p className="mt-3 text-sm text-pretty text-muted-foreground">
                            Angka di samping adalah target proyek, bukan capaian. Capaian saat ini: {stats.umkm} UMKM terverifikasi dan {stats.products} produk tayang (data demo).
                        </p>
                    </div>
                    <dl className="grid gap-4 sm:grid-cols-3">
                        <Target value={`${targets.active_umkm}`} label="UMKM aktif bergabung" />
                        <Target value={`+${targets.transaction_growth_percent}%`} label={`Transaksi online dalam ${targets.transaction_growth_months} bulan`} />
                        <Target value={`${targets.satisfaction_min.toString().replace('.', ',')}/5`} label="Kepuasan pengguna minimal" />
                    </dl>
                </div>
            </section>

            <section id="kredit-foto" className="container-page scroll-mt-24">
                <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8">
                    <h2 className="font-heading text-xl font-extrabold text-navy">Kredit foto</h2>
                    <p className="mt-2 max-w-2xl text-sm text-pretty text-muted-foreground">
                        Foto produk dan suasana pada mode demo berasal dari Wikimedia Commons dengan lisensi terbuka. Produk dan UMKM pada situs
                        ini fiktif dan tidak berkaitan dengan pemilik foto.
                    </p>
                    <ul className="mt-5 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                        {credits.map((c) => (
                            <li key={c.key} className="min-w-0">
                                <a href={c.source_url} target="_blank" rel="noopener noreferrer" className="font-semibold break-words text-navy hover:text-teal">
                                    {c.title}
                                </a>
                                <span className="block text-xs text-muted-foreground">
                                    {c.author} ·{' '}
                                    <a href={c.license_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        {c.license}
                                    </a>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </>
    );
}

function Target({ value, label }: { value: string; label: string }) {
    return (
        <div className="rounded-2xl bg-navy p-5 text-cream">
            <dd className="font-heading text-3xl font-extrabold text-gold">{value}</dd>
            <dt className="mt-2 text-sm text-cream/75">{label}</dt>
        </div>
    );
}
