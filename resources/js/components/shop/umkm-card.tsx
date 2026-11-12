import { Link } from '@inertiajs/react';
import { BadgeCheck, MapPin } from 'lucide-react';
import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { UmkmCardData } from '@/types/domain';

export function UmkmAvatar({
    name,
    logoUrl,
    className,
}: {
    name: string;
    logoUrl: string | null;
    className?: string;
}) {
    return (
        <span
            className={cn(
                'flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-navy font-heading text-sm font-extrabold text-gold ring-2 ring-ivory',
                className,
            )}
        >
            {logoUrl ? (
                <img src={logoUrl} alt="" className="size-full object-cover" />
            ) : (
                initials(name)
            )}
        </span>
    );
}

/** Kartu UMKM: sampul tipis, logo, nama, kota, jumlah produk. */
export default function UmkmCard({
    umkm,
    className,
}: {
    umkm: UmkmCardData;
    className?: string;
}) {
    return (
        <Link
            href={`/umkm/${umkm.slug}`}
            className={cn(
                'group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card transition-shadow hover:shadow-lift',
                className,
            )}
        >
            <div className="relative h-24 bg-teal-100">
                {umkm.cover_url ? (
                    <img
                        src={umkm.cover_url}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="motif-wave absolute inset-x-0 bottom-3 h-4 opacity-60" />
                )}
            </div>
            <div className="relative flex flex-1 flex-col px-4 pb-4">
                <UmkmAvatar
                    name={umkm.name}
                    logoUrl={umkm.logo_url}
                    className="-mt-6"
                />
                <h3 className="mt-3 flex items-center gap-1.5 font-heading text-base font-bold text-navy group-hover:text-teal">
                    <span className="truncate">{umkm.name}</span>
                    <BadgeCheck
                        className="size-4 shrink-0 text-teal"
                        aria-label="Terverifikasi"
                    />
                </h3>
                {umkm.tagline && (
                    <p className="mt-1 line-clamp-2 text-sm text-pretty text-muted-foreground">
                        {umkm.tagline}
                    </p>
                )}
                <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-xs font-semibold text-navy-700">
                    <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5 text-gold-700" />
                        {umkm.city}
                    </span>
                    <span>{umkm.products_count} produk</span>
                </div>
            </div>
        </Link>
    );
}
