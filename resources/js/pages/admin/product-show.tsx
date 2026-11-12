import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BadgeCheck, Eye, EyeOff, ExternalLink, XCircle } from 'lucide-react';
import { useState } from 'react';
import { ConfirmPostButton, quickPost, ReasonDialog } from '@/components/admin/actions';
import ProductImage from '@/components/brand/product-visual';
import PageHeader from '@/components/dashboard/page-header';
import { RatingInline } from '@/components/shared/rating';
import {
    ActiveBadge,
    DemoBadge,
    ProductStatusBadge,
    UmkmStatusBadge,
} from '@/components/shared/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateTime, formatNumber, formatRupiah } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { AdminProductDetail } from '@/types/admin';
import { FeaturedToggle, REJECT_SUGGESTIONS } from '@/components/admin/product-actions';

function Spec({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right font-semibold text-navy">{value}</dd>
        </div>
    );
}

export default function AdminProductShow({ product }: { product: AdminProductDetail }) {
    const [active, setActive] = useState(0);
    const [rejecting, setRejecting] = useState(false);
    const image = product.images[active];
    const story = product.story;

    return (
        <>
            <Head title={`Kurasi: ${product.name}`} />
            <Link href="/admin/produk" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:underline">
                <ArrowLeft className="size-4" />
                Kurasi Produk
            </Link>

            <PageHeader
                title={product.name}
                description={product.summary ?? undefined}
                actions={
                    <>
                        <Button asChild variant="outline" size="sm">
                            <a href={`/produk/${product.slug}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink />
                                {product.is_published ? 'Lihat di katalog' : 'Pratinjau'}
                            </a>
                        </Button>
                        {product.status !== 'rejected' && (
                            <Button variant="outline" size="sm" className="text-brick" onClick={() => setRejecting(true)}>
                                <XCircle />
                                Tolak
                            </Button>
                        )}
                        {product.status !== 'approved' && (
                            <ConfirmPostButton
                                url={`/admin/produk/${product.id}/setujui`}
                                title="Setujui produk ini?"
                                description={
                                    product.umkm?.status === 'approved'
                                        ? 'Produk akan langsung tampil di katalog Pasar Banua.'
                                        : 'Produk disetujui, tetapi baru tampil setelah UMKM-nya terverifikasi.'
                                }
                                confirmLabel="Setujui"
                            >
                                <BadgeCheck />
                                Setujui
                            </ConfirmPostButton>
                        )}
                    </>
                }
            />

            <div className="mb-6 flex flex-wrap items-center gap-2">
                <ProductStatusBadge status={product.status} />
                {product.is_featured && <Badge variant="gold">Unggulan</Badge>}
                {!product.is_active && <ActiveBadge active={false} inactiveLabel="Disembunyikan" />}
                {product.is_published ? <Badge variant="teal">Tayang di katalog</Badge> : <Badge variant="neutral">Belum tayang</Badge>}
                {product.is_demo && <DemoBadge />}
            </div>

            {product.rejection_reason && product.status === 'rejected' && (
                <div role="note" className="mb-6 rounded-xl border border-brick/20 bg-brick-100/60 px-4 py-3 text-sm text-navy">
                    <span className="font-semibold text-brick">Catatan penolakan: </span>
                    {product.rejection_reason}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
                <div className="grid content-start gap-6">
                    <section className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_5rem]">
                        <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-border/80 bg-cream-200">
                            <ProductImage
                                src={image?.url}
                                alt={image?.alt}
                                name={product.name}
                                categorySlug={product.category?.slug}
                                icon={product.category?.icon}
                            />
                        </div>
                        {product.images.length > 1 && (
                            <ul className="no-scrollbar flex gap-2 overflow-x-auto sm:flex-col">
                                {product.images.map((img, i) => (
                                    <li key={img.id} className="shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setActive(i)}
                                            aria-label={`Foto ${i + 1}`}
                                            aria-current={i === active}
                                            className={cn(
                                                'block size-16 overflow-hidden rounded-lg border-2 sm:size-20',
                                                i === active ? 'border-teal' : 'border-transparent opacity-70 hover:opacity-100',
                                            )}
                                        >
                                            <ProductImage src={img.url} alt={img.alt} name={product.name} label={false} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                    {product.images.length === 0 && (
                        <p className="-mt-3 text-sm font-medium text-gold-700">
                            Produk ini belum memiliki foto. Pertimbangkan meminta penjual menambahkan foto sebelum disetujui.
                        </p>
                    )}

                    <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-soft sm:p-6">
                        <h2 className="font-heading text-base font-bold text-navy">Deskripsi</h2>
                        <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-pretty text-navy/85">
                            {product.description || 'Penjual belum menulis deskripsi.'}
                        </p>
                    </section>

                    <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-soft sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h2 className="font-heading text-base font-bold text-navy">Cerita produk</h2>
                            {story && (
                                <Badge variant={story.is_verified ? 'teal' : 'gold'}>
                                    {story.is_verified ? 'Terverifikasi' : 'Konten contoh — belum diverifikasi'}
                                </Badge>
                            )}
                        </div>
                        {story ? (
                            <div className="mt-3 grid gap-3 text-sm leading-relaxed text-navy/85">
                                <p className="font-heading font-bold text-navy">{story.title}</p>
                                <p className="whitespace-pre-line text-pretty">{story.body}</p>
                                {[
                                    ['Proses pembuatan', story.process_note],
                                    ['Bahan', story.material_note],
                                    ['Nilai budaya', story.cultural_note],
                                ].map(([label, text]) =>
                                    text ? (
                                        <div key={label} className="rounded-xl bg-cream-200/60 px-4 py-3">
                                            <p className="eyebrow mb-1 text-teal">{label}</p>
                                            <p className="text-pretty">{text}</p>
                                        </div>
                                    ) : null,
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Pastikan klaim sejarah atau budaya tidak disajikan sebagai fakta bila belum diverifikasi.
                                </p>
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-muted-foreground">Penjual belum menulis cerita untuk produk ini.</p>
                        )}
                    </section>
                </div>

                <aside className="grid content-start gap-6">
                    <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-soft">
                        <h2 className="font-heading text-base font-bold text-navy">Rincian</h2>
                        <dl className="mt-2 divide-y divide-border/70">
                            <Spec label="Harga" value={formatRupiah(product.price)} />
                            <Spec label="Stok" value={formatNumber(product.stock)} />
                            <Spec label="Berat" value={product.weight_gram ? `${formatNumber(product.weight_gram)} g` : '-'} />
                            <Spec label="Kategori" value={product.category?.name ?? '-'} />
                            <Spec label="Terjual" value={formatNumber(product.sold_count)} />
                            <Spec label="Ulasan" value={<RatingInline rating={product.rating} count={product.reviews_count} />} />
                            <Spec label="Diperbarui" value={formatDateTime(product.updated_at)} />
                        </dl>
                    </section>

                    {product.umkm && (
                        <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-soft">
                            <h2 className="font-heading text-base font-bold text-navy">UMKM</h2>
                            <p className="mt-2 font-semibold text-navy">{product.umkm.name}</p>
                            <p className="text-sm text-muted-foreground">{product.umkm.city}</p>
                            <div className="mt-2">
                                <UmkmStatusBadge status={product.umkm.status} />
                            </div>
                            <Link href={`/admin/umkm/${product.umkm.id}`} className="mt-3 inline-block text-sm font-semibold text-teal hover:underline">
                                Lihat profil UMKM
                            </Link>
                        </section>
                    )}

                    <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-soft">
                        <h2 className="font-heading text-base font-bold text-navy">Penayangan</h2>
                        <div className="mt-3 flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-navy">Produk unggulan</p>
                                <p className="text-xs text-muted-foreground">Tampil di beranda dan urutan atas katalog.</p>
                            </div>
                            <FeaturedToggle product={product} />
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-4">
                            <div>
                                <p className="text-sm font-semibold text-navy">{product.is_active ? 'Ditampilkan' : 'Disembunyikan'}</p>
                                <p className="text-xs text-muted-foreground">Sembunyikan sementara tanpa mengubah status kurasi.</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => quickPost(`/admin/produk/${product.id}/tampil`)}>
                                {product.is_active ? <EyeOff /> : <Eye />}
                                {product.is_active ? 'Sembunyikan' : 'Tampilkan'}
                            </Button>
                        </div>
                    </section>
                </aside>
            </div>

            <ReasonDialog
                open={rejecting}
                onOpenChange={setRejecting}
                url={`/admin/produk/${product.id}/tolak`}
                title={`Tolak "${product.name}"?`}
                description="Catatan Anda dikirim ke penjual agar produk bisa diperbaiki dan diajukan ulang."
                confirmLabel="Tolak produk"
                suggestions={REJECT_SUGGESTIONS}
            />
        </>
    );
}
