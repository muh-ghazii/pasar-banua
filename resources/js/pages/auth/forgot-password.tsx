import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Lupa kata sandi" />

            {status && (
                <div role="status" className="mb-5 rounded-lg bg-teal-50 px-4 py-3 text-sm font-medium text-teal-700">
                    {status}
                </div>
            )}

            <Form {...email.form()} className="grid gap-5">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-1.5">
                            <Label htmlFor="email" className="font-semibold text-navy">Email</Label>
                            <Input id="email" type="email" name="email" autoComplete="off" autoFocus placeholder="nama@email.com" aria-invalid={!!errors.email} />
                            <InputError message={errors.email} />
                        </div>
                        <Button size="lg" className="w-full" disabled={processing} data-test="email-password-reset-link-button">
                            {processing && <Spinner />}
                            Kirim tautan atur ulang
                        </Button>
                    </>
                )}
            </Form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                Ingat kata sandi Anda? <TextLink href={login()}>Kembali masuk</TextLink>
            </p>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Lupa kata sandi?',
    description: 'Masukkan email akun Anda. Kami akan mengirim tautan untuk mengatur ulang kata sandi.',
};
