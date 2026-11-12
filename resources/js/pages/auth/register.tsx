import { Form, Head } from '@inertiajs/react';
import { ShoppingBag, Store } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
    defaultRole: 'customer' | 'seller';
};

const roles = [
    { value: 'customer', label: 'Pembeli', hint: 'Belanja produk lokal', icon: ShoppingBag },
    { value: 'seller', label: 'Pelaku UMKM', hint: 'Jual produk Anda', icon: Store },
] as const;

export default function Register({ passwordRules, defaultRole }: Props) {
    const [role, setRole] = useState<'customer' | 'seller'>(defaultRole);

    return (
        <>
            <Head title="Daftar" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <fieldset>
                            <legend className="mb-2 text-sm font-semibold text-navy">Saya ingin daftar sebagai</legend>
                            <input type="hidden" name="role" value={role} />
                            <div className="grid grid-cols-2 gap-2.5">
                                {roles.map((r) => (
                                    <button
                                        key={r.value}
                                        type="button"
                                        onClick={() => setRole(r.value)}
                                        aria-pressed={role === r.value}
                                        className={cn(
                                            'flex flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition-colors',
                                            role === r.value
                                                ? 'border-teal bg-teal-50 ring-1 ring-teal'
                                                : 'border-input bg-[#faf6f0] hover:border-teal/50',
                                        )}
                                    >
                                        <r.icon className={cn('size-5', role === r.value ? 'text-teal' : 'text-muted-foreground')} strokeWidth={1.75} />
                                        <span className="text-sm font-bold text-navy">{r.label}</span>
                                        <span className="text-xs text-muted-foreground">{r.hint}</span>
                                    </button>
                                ))}
                            </div>
                            <InputError message={errors.role} className="mt-1.5" />
                        </fieldset>

                        <div className="grid gap-1.5">
                            <Label htmlFor="name" className="font-semibold text-navy">
                                {role === 'seller' ? 'Nama pemilik' : 'Nama lengkap'}
                            </Label>
                            <Input id="name" type="text" required autoFocus tabIndex={1} autoComplete="name" name="name" placeholder="Nama sesuai identitas" aria-invalid={!!errors.name} />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="email" className="font-semibold text-navy">Email</Label>
                            <Input id="email" type="email" required tabIndex={2} autoComplete="email" name="email" placeholder="nama@email.com" aria-invalid={!!errors.email} />
                            <InputError message={errors.email} />
                        </div>

                        {role === 'seller' && (
                            <div className="grid gap-5 rounded-xl border border-teal/25 bg-teal-50/60 p-4">
                                <p className="text-xs text-pretty text-teal-700">
                                    Pendaftaran UMKM akan diverifikasi admin Pasar Banua sebelum produk Anda tampil di katalog.
                                </p>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="umkm_name" className="font-semibold text-navy">Nama UMKM</Label>
                                    <Input id="umkm_name" name="umkm_name" required tabIndex={3} placeholder="mis. Dapur Kayuh Banua" aria-invalid={!!errors.umkm_name} />
                                    <InputError message={errors.umkm_name} />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="city" className="font-semibold text-navy">Kota/kabupaten</Label>
                                        <Input id="city" name="city" required tabIndex={4} placeholder="mis. Banjarmasin" aria-invalid={!!errors.city} />
                                        <InputError message={errors.city} />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="phone" className="font-semibold text-navy">No. telepon/WA</Label>
                                        <Input id="phone" name="phone" type="tel" required tabIndex={5} autoComplete="tel" placeholder="08xxxxxxxxxx" aria-invalid={!!errors.phone} />
                                        <InputError message={errors.phone} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid gap-1.5">
                            <Label htmlFor="password" className="font-semibold text-navy">Kata sandi</Label>
                            <PasswordInput id="password" required tabIndex={6} autoComplete="new-password" name="password" placeholder="Minimal 8 karakter" passwordrules={passwordRules} aria-invalid={!!errors.password} />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="password_confirmation" className="font-semibold text-navy">Ulangi kata sandi</Label>
                            <PasswordInput id="password_confirmation" required tabIndex={7} autoComplete="new-password" name="password_confirmation" placeholder="Ketik ulang kata sandi" />
                            <InputError message={errors.password_confirmation} />
                        </div>

                        <Button type="submit" size="lg" className="mt-1 w-full" tabIndex={8} data-test="register-user-button">
                            {processing && <Spinner />}
                            {role === 'seller' ? 'Daftarkan UMKM saya' : 'Buat akun'}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Sudah punya akun?{' '}
                            <TextLink href={login()} tabIndex={9}>
                                Masuk
                            </TextLink>
                        </p>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Bergabung dengan Pasar Banua',
    description: 'Buat akun untuk berbelanja atau membuka toko UMKM Anda.',
};
