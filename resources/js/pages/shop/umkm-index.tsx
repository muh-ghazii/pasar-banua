import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Store } from 'lucide-react';
import EmptyState from '@/components/shared/empty-state';
import Pagination from '@/components/shared/pagination';
import UmkmCard from '@/components/shop/umkm-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Paginated, UmkmCardData } from '@/types/domain';

type Props = {
    umkms: Paginated<UmkmCardData>;
    cities: string[];
    filters: { kota: string };
};

export default function UmkmIndex({ umkms, cities, filters }: Props) {
    const chip = (active: boolean) =>
        cn(
            'inline-flex h-9 shrink-0 items-center rounded-full border px-4 text-sm font-semibold transition-colors',
            active ? 'border-navy bg-navy text-cream' : 'border-border bg-ivory text-navy hover:border-navy/40',
        );

    return (
        <>
            <Head title="UMKM Lokal" />
            <div className="container-page py-8 lg:py-12">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="eyebrow mb-2 text-teal">UMKM lokal</p>
                        <h1 className="font-heading text-3xl font-extrabold text-navy sm:text-4xl">Para pembuat di balik Pasar Banua</h1>
                        <p className="mt-2 max-w-xl text-sm text-pretty text-muted-foreground">
                            Semua UMKM di bawah ini telah diverifikasi tim Pasar Banua sebelum dapat berjualan.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/register?sebagai=umkm">
                            Gabung sebagai UMKM
                            <ArrowRight />
                        </Link>
                    </Button>
                </div>

                <nav aria-label="Filter kota" className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
                    <Link href="/umkm" className={chip(filters.kota === '')} preserveScroll>
                        Semua kota
                    </Link>
                    {cities.map((c) => (
                        <Link key={c} href={`/umkm?kota=${encodeURIComponent(c)}`} className={chip(filters.kota === c)} preserveScroll>
                            {c}
                        </Link>
                    ))}
                </nav>

                <div className="mt-6">
                    {umkms.data.length === 0 ? (
                        <EmptyState icon={Store} title="Belum ada UMKM di lokasi ini" />
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {umkms.data.map((u) => (
                                <UmkmCard key={u.id} umkm={u} />
                            ))}
                        </div>
                    )}
                    <Pagination paginator={umkms} className="mt-10" />
                </div>
            </div>
        </>
    );
}
