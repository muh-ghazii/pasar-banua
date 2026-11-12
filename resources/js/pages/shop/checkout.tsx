import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Info, Lock, MapPin, Store } from 'lucide-react';
import ProductImage from '@/components/brand/product-visual';
import FormField from '@/components/shared/form-field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { formatRupiah } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { CartSummary } from '@/types/shop';

type Address = {
    id: number;
    label: string;
    recipient_name: string;
    phone: string;
    address_line: string;
    city: string | null;
    postal_code: string | null;
    is_default: boolean;
};

type Props = {
    cart: CartSummary;
    addresses: Address[];
    defaults: { recipient_name: string; phone: string | null };
    paymentMethods: { value: string; label: string }[];
};

export default function Checkout({ cart, addresses, defaults, paymentMethods }: Props) {
    const preferred = addresses.find((a) => a.is_default) ?? addresses[0];
    const form = useForm({
        recipient_name: preferred?.recipient_name ?? defaults.recipient_name,
        phone: preferred?.phone ?? defaults.phone ?? '',
        address_line: preferred?.address_line ?? '',
        city: preferred?.city ?? '',
        postal_code: preferred?.postal_code ?? '',
        notes: '',
        payment_method: paymentMethods[0]?.value ?? 'transfer_demo',
        save_address: addresses.length === 0,
    });
    const errors = form.errors as Record<string, string | undefined>;

    const applyAddress = (a: Address) => {
        form.setData((d) => ({
            ...d,
            recipient_name: a.recipient_name,
            phone: a.phone,
            address_line: a.address_line,
            city: a.city ?? '',
            postal_code: a.postal_code ?? '',
        }));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/checkout', { preserveScroll: true });
    };

    return (
        <>
            <Head title="Checkout" />
            <div className="container-page py-8 lg:py-12">
                <Link
                    href="/keranjang"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:underline"
                >
                    <ArrowLeft className="size-4" />
                    Kembali ke keranjang
                </Link>
                <div className="mt-4 mb-8 flex flex-wrap items-center gap-3">
                    <h1 className="font-heading text-3xl font-extrabold text-navy sm:text-4xl">
                        Checkout
                    </h1>
                    <Badge variant="gold">MODE DEMO</Badge>
                </div>

                <form
                    onSubmit={submit}
                    noValidate
                    className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-10"
                >
                    <div className="space-y-6">
                        {errors.cart && (
                            <div
                                role="alert"
                                className="flex items-start gap-3 rounded-xl border border-brick/30 bg-brick-100/70 p-4 text-sm text-brick"
                            >
                                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                                <span>
                                    {errors.cart}{' '}
                                    <Link href="/keranjang" className="font-semibold underline">
                                        Buka keranjang
                                    </Link>
                                </span>
                            </div>
                        )}

                        <section className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6">
                            <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-navy">
                                <MapPin className="size-5 text-teal" />
                                Alamat pengiriman
                            </h2>

                            {addresses.length > 0 && (
                                <div className="mt-4">
                                    <p className="mb-2 text-xs font-semibold text-muted-foreground">
                                        Gunakan alamat tersimpan
                                    </p>
                                    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                                        {addresses.map((a) => {
                                            const active =
                                                form.data.address_line === a.address_line &&
                                                form.data.recipient_name === a.recipient_name;

                                            return (
                                                <button
                                                    key={a.id}
                                                    type="button"
                                                    onClick={() => applyAddress(a)}
                                                    aria-pressed={active}
                                                    className={cn(
                                                        'w-56 shrink-0 rounded-xl border p-3 text-left text-xs transition-colors',
                                                        active
                                                            ? 'border-teal bg-teal-50 ring-1 ring-teal'
                                                            : 'border-input bg-ivory hover:border-teal/50',
                                                    )}
                                                >
                                                    <span className="block font-bold text-navy">
                                                        {a.label} · {a.recipient_name}
                                                    </span>
                                                    <span className="mt-1 line-clamp-2 block text-muted-foreground">
                                                        {a.address_line}
                                                        {a.city ? `, ${a.city}` : ''}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <FormField label="Nama penerima" htmlFor="recipient_name" error={errors.recipient_name} required>
                                    <Input
                                        id="recipient_name"
                                        autoComplete="name"
                                        value={form.data.recipient_name}
                                        onChange={(e) => form.setData('recipient_name', e.target.value)}
                                        aria-invalid={!!errors.recipient_name}
                                    />
                                </FormField>
                                <FormField label="Nomor telepon" htmlFor="phone" error={errors.phone} required hint="Dihubungi kurir atau penjual bila perlu.">
                                    <Input
                                        id="phone"
                                        type="tel"
                                        inputMode="tel"
                                        autoComplete="tel"
                                        placeholder="08xxxxxxxxxx"
                                        value={form.data.phone}
                                        onChange={(e) => form.setData('phone', e.target.value)}
                                        aria-invalid={!!errors.phone}
                                    />
                                </FormField>
                                <FormField label="Alamat lengkap" htmlFor="address_line" error={errors.address_line} required className="sm:col-span-2">
                                    <Textarea
                                        id="address_line"
                                        rows={3}
                                        autoComplete="street-address"
                                        placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                                        value={form.data.address_line}
                                        onChange={(e) => form.setData('address_line', e.target.value)}
                                        aria-invalid={!!errors.address_line}
                                    />
                                </FormField>
                                <FormField label="Kota/kabupaten" htmlFor="city" error={errors.city} required>
                                    <Input
                                        id="city"
                                        autoComplete="address-level2"
                                        placeholder="Banjarmasin"
                                        value={form.data.city}
                                        onChange={(e) => form.setData('city', e.target.value)}
                                        aria-invalid={!!errors.city}
                                    />
                                </FormField>
                                <FormField label="Kode pos" htmlFor="postal_code" error={errors.postal_code}>
                                    <Input
                                        id="postal_code"
                                        inputMode="numeric"
                                        autoComplete="postal-code"
                                        maxLength={5}
                                        placeholder="70111"
                                        value={form.data.postal_code}
                                        onChange={(e) => form.setData('postal_code', e.target.value.replace(/\D/g, ''))}
                                        aria-invalid={!!errors.postal_code}
                                    />
                                </FormField>
                                <FormField label="Catatan pesanan" htmlFor="notes" error={errors.notes} hint="Opsional, mis. patokan rumah atau permintaan kemasan." className="sm:col-span-2">
                                    <Textarea
                                        id="notes"
                                        rows={2}
                                        maxLength={500}
                                        value={form.data.notes}
                                        onChange={(e) => form.setData('notes', e.target.value)}
                                    />
                                </FormField>
                            </div>
                            <div className="mt-4 flex items-center gap-2.5">
                                <Checkbox
                                    id="save_address"
                                    checked={form.data.save_address}
                                    onCheckedChange={(v) => form.setData('save_address', v === true)}
                                />
                                <Label htmlFor="save_address" className="text-sm font-normal text-navy">
                                    Simpan alamat ini untuk pesanan berikutnya
                                </Label>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6">
                            <h2 className="font-heading text-lg font-bold text-navy">Metode pembayaran</h2>
                            <div className="mt-4 grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="Metode pembayaran">
                                {paymentMethods.map((m) => {
                                    const active = form.data.payment_method === m.value;

                                    return (
                                        <button
                                            key={m.value}
                                            type="button"
                                            role="radio"
                                            aria-checked={active}
                                            onClick={() => form.setData('payment_method', m.value)}
                                            className={cn(
                                                'flex items-center gap-3 rounded-xl border p-4 text-left text-sm font-semibold transition-colors',
                                                active
                                                    ? 'border-teal bg-teal-50 text-navy ring-1 ring-teal'
                                                    : 'border-input bg-ivory text-navy hover:border-teal/50',
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'flex size-4 shrink-0 items-center justify-center rounded-full border-2',
                                                    active ? 'border-teal' : 'border-input',
                                                )}
                                            >
                                                {active && <span className="size-2 rounded-full bg-teal" />}
                                            </span>
                                            {m.label}
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.payment_method && (
                                <p className="mt-2 text-xs text-brick">{errors.payment_method}</p>
                            )}
                            <p className="mt-4 flex items-start gap-2 rounded-lg bg-gold-100/70 p-3 text-xs leading-relaxed text-gold-700">
                                <Info className="mt-px size-4 shrink-0" />
                                Pasar Banua belum terhubung dengan payment gateway
                                maupun ekspedisi. Pesanan pada mode demo tidak
                                memotong saldo apa pun; penjual memperbarui status
                                secara manual dari dashboard.
                            </p>
                        </section>
                    </div>

                    <aside className="lg:sticky lg:top-24 lg:self-start">
                        <div className="rounded-2xl border border-border/80 bg-ivory p-5 sm:p-6">
                            <h2 className="font-heading text-lg font-bold text-navy">Ringkasan pesanan</h2>
                            <div className="mt-4 space-y-5">
                                {cart.groups.map((g) => (
                                    <div key={g.umkm.id}>
                                        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-navy">
                                            <Store className="size-3.5 text-teal" />
                                            {g.umkm.name}
                                        </p>
                                        <ul className="grid gap-2.5">
                                            {g.items.map((item) => (
                                                <li key={item.id} className="flex items-center gap-3">
                                                    <span className="size-12 shrink-0 overflow-hidden rounded-lg bg-cream-200">
                                                        <ProductImage
                                                            src={item.product.image_url}
                                                            name={item.product.name}
                                                            categorySlug={item.product.category_slug}
                                                            label={false}
                                                        />
                                                    </span>
                                                    <span className="min-w-0 flex-1 text-sm">
                                                        <span className="line-clamp-1 font-semibold text-navy">{item.product.name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {item.quantity} × {formatRupiah(item.product.price)}
                                                        </span>
                                                    </span>
                                                    <span className="text-sm font-semibold text-navy">{formatRupiah(item.line_total)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="mt-2 flex justify-between text-xs text-muted-foreground">
                                            <span>Ongkir (tarif tetap demo)</span>
                                            <span>{formatRupiah(g.shipping_fee)}</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <dl className="mt-5 grid gap-2 border-t border-border pt-4 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Subtotal</dt>
                                    <dd className="font-semibold text-navy">{formatRupiah(cart.subtotal)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Ongkos kirim</dt>
                                    <dd className="font-semibold text-navy">{formatRupiah(cart.shipping_fee)}</dd>
                                </div>
                                <div className="mt-1 flex items-baseline justify-between border-t border-border pt-3">
                                    <dt className="font-semibold text-navy">Total bayar</dt>
                                    <dd className="font-heading text-2xl font-extrabold text-navy">{formatRupiah(cart.total)}</dd>
                                </div>
                            </dl>
                            <Button
                                type="submit"
                                size="lg"
                                className="mt-5 w-full"
                                disabled={form.processing || cart.has_issues}
                            >
                                {form.processing ? <Spinner /> : <Lock />}
                                Buat pesanan
                            </Button>
                            <p className="mt-3 text-center text-xs text-muted-foreground">
                                Total akhir dihitung ulang oleh server.
                            </p>
                        </div>
                    </aside>
                </form>
            </div>
        </>
    );
}
