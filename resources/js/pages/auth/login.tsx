import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Masuk" />

            {status && (
                <div
                    role="status"
                    className="mb-5 rounded-lg bg-teal-50 px-4 py-3 text-sm font-medium text-teal-700"
                >
                    {status}
                </div>
            )}

            <Form {...store.form()} resetOnSuccess={['password']} className="flex flex-col gap-5">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-1.5">
                            <Label htmlFor="email" className="font-semibold text-navy">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                placeholder="nama@email.com"
                                aria-invalid={!!errors.email}
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-1.5">
                            <div className="flex items-center">
                                <Label htmlFor="password" className="font-semibold text-navy">
                                    Kata sandi
                                </Label>
                                {canResetPassword && (
                                    <TextLink href={request()} className="ml-auto text-sm" tabIndex={5}>
                                        Lupa kata sandi?
                                    </TextLink>
                                )}
                            </div>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                placeholder="Masukkan kata sandi"
                                aria-invalid={!!errors.password}
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center gap-2.5">
                            <Checkbox id="remember" name="remember" tabIndex={3} />
                            <Label htmlFor="remember" className="font-normal">
                                Ingat saya di perangkat ini
                            </Label>
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            tabIndex={4}
                            disabled={processing}
                            data-test="login-button"
                        >
                            {processing && <Spinner />}
                            Masuk
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Belum punya akun?{' '}
                            <TextLink href={register()} tabIndex={6}>
                                Daftar sekarang
                            </TextLink>
                        </p>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Selamat datang kembali',
    description: 'Masuk untuk berbelanja atau mengelola toko UMKM Anda.',
};
