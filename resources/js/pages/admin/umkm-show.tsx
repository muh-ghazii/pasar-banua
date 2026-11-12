import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    BadgeCheck,
    Ban,
    ExternalLink,
    Instagram,
    Mail,
    MapPin,
    Pencil,
    Phone,
    RotateCcw,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmPostButton, ReasonDialog } from '@/components/admin/actions';
import ProductImage from '@/components/brand/product-visual';
import PageHeader from '@/components/dashboard/page-header';
import StatCard from '@/components/dashboard/stat-card';
import EmptyState from '@/components/shared/empty-state';
import FormField from '@/components/shared/form-field';
import {
    ActiveBadge,
    DemoBadge,
    ProductStatusBadge,
    UmkmStatusBadge,
} from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { formatCompactRupiah, formatDate, formatRupiah, initials } from '@/lib/format';
import type { AdminUmkmDetail } from '@/types/admin';
import type { ProductStatus } from '@/types/domain';

type ProductLite = {
    id: number;
    name: string;
    slug: string;
    price: number;
    stock: number;
    status: ProductStatus;
    is_active: boolean;
    image_url: string | null;
    category_slug: string | null;
    category_icon: string | null;
};

type Stats = {
    products: number;
    products_published: number;
    orders: number;
    orders_pending: number;
    revenue: number;
};

function EditSheet({ umkm, open, onOpenChange }: { umkm: AdminUmkmDetail; open: boolean; onOpenChange: (v: boolean) => void }) {
    const form = useForm({
        name: umkm.name,
        tagline: umkm.tagline ?? '',
        description: umkm.description ?? '',
        city: umkm.city,
        address: umkm.address ?? '',
        phone: umkm.phone ?? '',
        whatsapp: umkm.whatsapp ?? '',
        instagram: umkm.instagram ?? '',
    });

    const field = (key: keyof typeof form.data) => ({
        id: `umkm-${key}`,
        value: form.data[key],
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => form.setData(key, e.target.value),
        'aria-invalid': !!form.errors[key],
    });

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full gap-0 overflow-y-auto bg-background p-0 sm:max-w-lg">
                <SheetHeader className="border-b border-border px-6 py-5">
                    <SheetTitle className="font-heading text-lg font-bold text-navy">Ubah informasi UMKM</SheetTitle>
                    <SheetDescription>Perubahan langsung tampil di halaman profil toko.</SheetDescription>
                </SheetHeader>
                <form
                    className="grid gap-4 px-6 py-5"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.put(`/admin/umkm/${umkm.id}`, {
                            preserveScroll: true,
                            onSuccess: () => onOpenChange(false),
                        });
                    }}
                >
                    <FormField label="Nama UMKM" htmlFor="umkm-name" error={form.errors.name} required>
                        <Input {...field('name')} required maxLength={120} />
                    </FormField>
                    <FormField label="Tagline" htmlFor="umkm-tagline" error={form.errors.tagline} hint="Kalimat singkat, maksimal 160 karakter.">
                        <Input {...field('tagline')} maxLength={160} />
                    </FormField>
                    <FormField label="Deskripsi usaha" htmlFor="umkm-description" error={form.errors.description}>
                        <Textarea {...field('description')} rows={5} maxLength={2000} />
                    </FormField>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormField label="Kota/kabupaten" htmlFor="umkm-city" error={form.errors.city} required>
                            <Input {...field('city')} required maxLength={100} />
                        </FormField>
                        <FormField label="Instagram" htmlFor="umkm-instagram" error={form.errors.instagram}>
                            <Input {...field('instagram')} placeholder="namatoko" maxLength={100} />
                        </FormField>
                    </div>
                    <FormField label="Alamat" htmlFor="umkm-address" error={form.errors.address}>
                        <Input {...field('address')} maxLength={255} />
                    </FormField>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormField label="Telepon" htmlFor="umkm-phone" error={form.errors.phone}>
                            <Input {...field('phone')} type="tel" inputMode="tel" />
                        </FormField>
                        <FormField label="WhatsApp" htmlFor="umkm-whatsapp" error={form.errors.whatsapp}>
                            <Input {...field('whatsapp')} type="tel" inputMode="tel" />
                        </FormField>
                    </div>
                    <div className="sticky bottom-0 -mx-6 mt-2 flex justify-end gap-2 border-t border-border bg-background px-6 py-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Spinner />}
                            Simpan perubahan
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}

function InfoRow({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; children: React.ReactNode }) {
    return (
        <li className="flex items-start gap-2.5 text-sm text-navy">
            <Icon className="mt-0.5 size-4 shrink-0 text-teal" strokeWidth={1.75} />
            <span className="min-w-0 break-words">{children}</span>
        </li>
    );
}

export default function AdminUmkmShow({
    umkm,
    products,
    stats,
}: {
    umkm: AdminUmkmDetail;
    products: ProductLite[];
    stats: Stats;
}) {
    const [editing, setEditing] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [suspending, setSuspending] = useState(false);

    const actions = (
        <>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Pencil />
                Ubah info
            </Button>
            {umkm.status === 'approved' && (
                <>
                    <Button asChild variant="outline" size="sm">
                        <a href={`/umkm/${umkm.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink />
                            Profil publik
                        </a>
                    </Button>
                    <Button variant="outline" size="sm" className="text-brick" onClick={() => setSuspending(true)}>
                        <Ban />
                        Nonaktifkan
                    </Button>
                </>
            )}
            {(umkm.status === 'pending' || umkm.status === 'rejected') && (
                <>
                    {umkm.status === 'pending' && (
                        <Button variant="outline" size="sm" className="text-brick" onClick={() => setRejecting(true)}>
                            <XCircle />
                            Tolak
                        </Button>
                    )}
                    <ConfirmPostButton
                        url={`/admin/umkm/${umkm.id}/setujui`}
                        title={`Verifikasi ${umkm.name}?`}
                        description="UMKM akan berstatus terverifikasi. Produk yang sudah lolos kurasi akan langsung tampil di katalog."
                        confirmLabel="Ya, verifikasi"
                    >
                        <BadgeCheck />
                        Verifikasi
                    </ConfirmPostButton>
                </>
            )}
            {umkm.status === 'suspended' && (
                <ConfirmPostButton
                    url={`/admin/umkm/${umkm.id}/aktifkan`}
                    title={`Aktifkan kembali ${umkm.name}?`}
                    description="Produk yang disetujui akan kembali tampil di katalog."
                    confirmLabel="Aktifkan"
                >
                    <RotateCcw />
                    Aktifkan kembali
                </ConfirmPostButton>
            )}
        </>
    );

    return (
        <>
            <Head title={umkm.name} />
            <Link href="/admin/umkm" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:underline">
                <ArrowLeft className="size-4" />
                Data UMKM
            </Link>

            <PageHeader title={umkm.name} description={umkm.tagline ?? undefined} actions={actions} />

            <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
                <UmkmStatusBadge status={umkm.status} />
                {umkm.is_demo && <DemoBadge />}
                <span className="text-muted-foreground">
                    Mendaftar {formatDate(umkm.created_at)}
                    {umkm.verified_at && ` · Diverifikasi ${formatDate(umkm.verified_at)}`}
                </span>
            </div>

            {umkm.rejection_reason && umkm.status !== 'approved' && (
                <div role="note" className="mb-6 rounded-xl border border-brick/20 bg-brick-100/60 px-4 py-3 text-sm text-navy">
                    <span className="font-semibold text-brick">
                        {umkm.status === 'suspended' ? 'Alasan penonaktifan: ' : 'Alasan penolakan: '}
                    </span>
                    {umkm.rejection_reason}
                </div>
            )}

            <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <StatCard label="Produk" value={stats.products} hint={`${stats.products_published} tayang di katalog`} />
                <StatCard label="Pesanan" value={stats.orders} hint={`${stats.orders_pending} menunggu konfirmasi`} tone="navy" />
                <StatCard label="Nilai transaksi" value={formatCompactRupiah(stats.revenue)} hint={formatRupiah(stats.revenue)} tone="gold" />
                <StatCard
                    label="Akun pemilik"
                    value={umkm.owner?.is_active ? 'Aktif' : 'Nonaktif'}
                    hint={umkm.owner ? `Sejak ${formatDate(umkm.owner.created_at)}` : '-'}
                    tone={umkm.owner?.is_active ? 'teal' : 'brick'}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="grid gap-6">
                    <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-soft sm:p-6">
                        <h2 className="font-heading text-base font-bold text-navy">Tentang usaha</h2>
                        <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-pretty text-navy/85">
                            {umkm.description || 'Pemilik belum menuliskan deskripsi usaha.'}
                        </p>
                        {umkm.story && (
                            <>
                                <h3 className="mt-5 font-heading text-sm font-bold text-navy">Cerita UMKM</h3>
                                <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line text-pretty text-navy/85">{umkm.story}</p>
                            </>
                        )}
                    </section>

                    <section>
                        <h2 className="mb-3 font-heading text-base font-bold text-navy">Produk terbaru</h2>
                        {products.length === 0 ? (
                            <EmptyState title="Belum ada produk" description="UMKM ini belum mengunggah produk." />
                        ) : (
                            <ul className="grid gap-3 sm:grid-cols-2">
                                {products.map((p) => (
                                    <li key={p.id}>
                                        <Link
                                            href={`/admin/produk/${p.id}`}
                                            className="flex gap-3 rounded-2xl border border-border/80 bg-card p-3 shadow-soft transition-colors hover:border-teal/40"
                                        >
                                            <span className="size-16 shrink-0 overflow-hidden rounded-xl">
                                                <ProductImage src={p.image_url} name={p.name} categorySlug={p.category_slug} icon={p.category_icon} label={false} />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-semibold text-navy">{p.name}</span>
                                                <span className="block text-xs text-muted-foreground">
                                                    {formatRupiah(p.price)} · stok {p.stock}
                                                </span>
                                                <span className="mt-1.5 flex flex-wrap gap-1">
                                                    <ProductStatusBadge status={p.status} />
                                                    {!p.is_active && <ActiveBadge active={false} inactiveLabel="Disembunyikan" />}
                                                </span>
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {stats.products > products.length && (
                            <Link href={`/admin/produk?umkm=${umkm.id}`} className="mt-3 inline-block text-sm font-semibold text-teal hover:underline">
                                Lihat semua {stats.products} produk
                            </Link>
                        )}
                    </section>
                </div>

                <aside className="grid content-start gap-6">
                    <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-soft">
                        <h2 className="mb-3 font-heading text-base font-bold text-navy">Kontak usaha</h2>
                        <ul className="grid gap-2.5">
                            <InfoRow icon={MapPin}>
                                {umkm.address ? `${umkm.address}, ` : ''}
                                {umkm.city}
                            </InfoRow>
                            {umkm.phone && <InfoRow icon={Phone}>{umkm.phone}</InfoRow>}
                            {umkm.whatsapp && <InfoRow icon={Phone}>WhatsApp {umkm.whatsapp}</InfoRow>}
                            {umkm.instagram && <InfoRow icon={Instagram}>@{umkm.instagram}</InfoRow>}
                        </ul>
                    </section>

                    {umkm.owner && (
                        <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-soft">
                            <h2 className="mb-3 font-heading text-base font-bold text-navy">Pemilik akun</h2>
                            <div className="flex items-center gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-cream">
                                    {initials(umkm.owner.name)}
                                </span>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-navy">{umkm.owner.name}</p>
                                    <ActiveBadge active={umkm.owner.is_active} />
                                </div>
                            </div>
                            <ul className="mt-3 grid gap-2.5">
                                <InfoRow icon={Mail}>{umkm.owner.email}</InfoRow>
                                {umkm.owner.phone && <InfoRow icon={Phone}>{umkm.owner.phone}</InfoRow>}
                            </ul>
                            <Link
                                href={`/admin/pengguna?q=${encodeURIComponent(umkm.owner.email)}`}
                                className="mt-4 inline-block text-sm font-semibold text-teal hover:underline"
                            >
                                Kelola akun pengguna
                            </Link>
                        </section>
                    )}
                </aside>
            </div>

            <EditSheet umkm={umkm} open={editing} onOpenChange={setEditing} />
            <ReasonDialog
                open={rejecting}
                onOpenChange={setRejecting}
                url={`/admin/umkm/${umkm.id}/tolak`}
                title={`Tolak pendaftaran ${umkm.name}?`}
                description="Alasan akan dikirim ke pemilik UMKM sebagai notifikasi agar mereka bisa memperbaiki data."
                confirmLabel="Tolak pendaftaran"
                suggestions={['Data kontak tidak dapat diverifikasi', 'Produk di luar kategori Pasar Banua', 'Lokasi usaha di luar Kalimantan Selatan']}
            />
            <ReasonDialog
                open={suspending}
                onOpenChange={setSuspending}
                url={`/admin/umkm/${umkm.id}/nonaktifkan`}
                title={`Nonaktifkan ${umkm.name}?`}
                description="Semua produk UMKM ini disembunyikan dari katalog sampai diaktifkan kembali."
                confirmLabel="Nonaktifkan"
                suggestions={['Banyak pesanan tidak diproses', 'Laporan pembeli sedang ditinjau']}
            />
        </>
    );
}
