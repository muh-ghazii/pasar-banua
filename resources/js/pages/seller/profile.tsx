import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle, BadgeCheck, Clock, ExternalLink, Save } from 'lucide-react';
import ImageUploader from '@/components/dashboard/image-uploader';
import PageHeader from '@/components/dashboard/page-header';
import FormField from '@/components/shared/form-field';
import { DemoBadge, UmkmStatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/lib/format';
import type { SellerUmkmProfile } from '@/types/seller';

type FormData = {
    name: string;
    tagline: string;
    description: string;
    story: string;
    city: string;
    address: string;
    phone: string;
    whatsapp: string;
    instagram: string;
    logo: File[];
    cover: File[];
    remove_logo: boolean;
    remove_cover: boolean;
};

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
    return (
        <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-soft sm:p-6">
            <h2 className="font-heading text-base font-bold text-navy">{title}</h2>
            {description && <p className="mt-1 text-sm text-pretty text-muted-foreground">{description}</p>}
            <div className="mt-5 grid gap-5">{children}</div>
        </section>
    );
}

export default function SellerProfile({ umkm, maxImageMb }: { umkm: SellerUmkmProfile; maxImageMb: number }) {
    const form = useForm<FormData>({
        name: umkm.name,
        tagline: umkm.tagline ?? '',
        description: umkm.description ?? '',
        story: umkm.story ?? '',
        city: umkm.city,
        address: umkm.address ?? '',
        phone: umkm.phone ?? '',
        whatsapp: umkm.whatsapp ?? '',
        instagram: umkm.instagram ? `@${umkm.instagram}` : '',
        logo: [],
        cover: [],
        remove_logo: false,
        remove_cover: false,
    });
    const { data, setData, errors, processing } = form;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.transform((d) => ({
            ...d,
            _method: 'put',
            logo: d.logo[0] ?? null,
            cover: d.cover[0] ?? null,
        }));
        form.post('/seller/profil', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => form.setData((d) => ({ ...d, logo: [], cover: [] })),
        });
    };

    const statusNote = {
        pending: { icon: Clock, tone: 'border-gold/30 bg-gold-100/60 text-gold-700', text: 'Profil sedang menunggu verifikasi admin. Pastikan nama, kota, kontak, dan deskripsi sudah benar.' },
        approved: { icon: BadgeCheck, tone: 'border-teal/20 bg-teal-50 text-teal-700', text: `UMKM terverifikasi${umkm.verified_at ? ` sejak ${formatDate(umkm.verified_at)}` : ''}. Profil tampil di halaman toko Anda.` },
        rejected: { icon: AlertTriangle, tone: 'border-brick/25 bg-brick-100/60 text-brick', text: `Pendaftaran ditolak${umkm.rejection_reason ? `: ${umkm.rejection_reason}` : '.'} Perbaiki profil lalu simpan untuk mengajukan verifikasi ulang.` },
        suspended: { icon: AlertTriangle, tone: 'border-border bg-cream-200 text-navy', text: 'UMKM sedang dinonaktifkan admin. Produk tidak tampil di katalog. Hubungi admin Pasar Banua untuk informasi lebih lanjut.' },
    }[umkm.status];

    return (
        <>
            <Head title="Profil UMKM" />
            <PageHeader
                eyebrow="Toko"
                title="Profil UMKM"
                description="Profil yang lengkap membangun kepercayaan pembeli dan mempercepat verifikasi."
                actions={
                    <>
                        {umkm.is_demo && <DemoBadge />}
                        <UmkmStatusBadge status={umkm.status} />
                        {umkm.status === 'approved' && (
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/umkm/${umkm.slug}`}>
                                    <ExternalLink />
                                    Lihat halaman toko
                                </Link>
                            </Button>
                        )}
                    </>
                }
            />

            <div className={`mb-6 flex gap-3 rounded-2xl border p-4 text-sm ${statusNote.tone}`}>
                <statusNote.icon className="mt-0.5 size-5 shrink-0" strokeWidth={1.75} />
                <p className="text-pretty">{statusNote.text}</p>
            </div>

            <form onSubmit={submit} className="pb-24 lg:pb-0" noValidate>
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
                    <div className="grid gap-6">
                        <Section title="Identitas usaha">
                            <FormField label="Nama UMKM" htmlFor="name" error={errors.name} required>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} maxLength={120} aria-invalid={!!errors.name} />
                            </FormField>
                            <FormField label="Tagline" htmlFor="tagline" error={errors.tagline} hint="Satu kalimat singkat, mis. “Amplang renyah dari dapur keluarga di Kotabaru”.">
                                <Input id="tagline" value={data.tagline} onChange={(e) => setData('tagline', e.target.value)} maxLength={160} />
                            </FormField>
                            <FormField label="Deskripsi usaha" htmlFor="description" error={errors.description} hint="Apa yang Anda buat, sejak kapan, dan apa yang membuatnya berbeda.">
                                <Textarea id="description" rows={5} value={data.description} onChange={(e) => setData('description', e.target.value)} maxLength={2000} />
                            </FormField>
                            <FormField label="Cerita UMKM" htmlFor="story" error={errors.story} hint="Opsional. Kisah perjalanan usaha atau orang-orang di baliknya.">
                                <Textarea id="story" rows={6} value={data.story} onChange={(e) => setData('story', e.target.value)} maxLength={5000} />
                            </FormField>
                        </Section>

                        <Section title="Lokasi dan kontak" description="Kontak dipakai pembeli untuk bertanya seputar pesanan.">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <FormField label="Kota/kabupaten" htmlFor="city" error={errors.city} required>
                                    <Input id="city" value={data.city} onChange={(e) => setData('city', e.target.value)} placeholder="Banjarmasin" aria-invalid={!!errors.city} />
                                </FormField>
                                <FormField label="Nomor telepon" htmlFor="phone" error={errors.phone} required>
                                    <Input id="phone" type="tel" value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="08xxxxxxxxxx" aria-invalid={!!errors.phone} />
                                </FormField>
                            </div>
                            <FormField label="Alamat usaha" htmlFor="address" error={errors.address}>
                                <Input id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} placeholder="Nama jalan, kelurahan, kecamatan" />
                            </FormField>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <FormField label="WhatsApp" htmlFor="whatsapp" error={errors.whatsapp}>
                                    <Input id="whatsapp" type="tel" value={data.whatsapp} onChange={(e) => setData('whatsapp', e.target.value)} placeholder="08xxxxxxxxxx" />
                                </FormField>
                                <FormField label="Instagram" htmlFor="instagram" error={errors.instagram}>
                                    <Input id="instagram" value={data.instagram} onChange={(e) => setData('instagram', e.target.value)} placeholder="@namausaha" />
                                </FormField>
                            </div>
                        </Section>
                    </div>

                    <div className="grid gap-6 lg:sticky lg:top-24">
                        <Section title="Logo atau foto usaha">
                            <ImageUploader
                                files={data.logo}
                                onFilesChange={(files) => setData('logo', files)}
                                existing={umkm.logo_url && !data.remove_logo ? [{ id: 1, url: umkm.logo_url, alt: 'Logo' }] : []}
                                onRemovedChange={() => setData('remove_logo', true)}
                                multiple={false}
                                maxSizeMb={maxImageMb}
                                label="Unggah logo"
                                error={errors.logo}
                            />
                        </Section>
                        <Section title="Foto sampul">
                            <ImageUploader
                                files={data.cover}
                                onFilesChange={(files) => setData('cover', files)}
                                existing={umkm.cover_url && !data.remove_cover ? [{ id: 1, url: umkm.cover_url, alt: 'Sampul' }] : []}
                                onRemovedChange={() => setData('remove_cover', true)}
                                multiple={false}
                                shape="wide"
                                maxSizeMb={maxImageMb}
                                label="Unggah sampul"
                                error={errors.cover}
                            />
                        </Section>
                        <Button type="submit" size="lg" className="hidden lg:inline-flex" disabled={processing}>
                            {processing ? <Spinner /> : <Save />}
                            Simpan profil
                        </Button>
                    </div>
                </div>

                <div className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 pt-3 backdrop-blur lg:hidden">
                    <Button type="submit" className="h-11 w-full" disabled={processing}>
                        {processing ? <Spinner /> : <Save />}
                        Simpan profil
                    </Button>
                </div>
            </form>
        </>
    );
}
