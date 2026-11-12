import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Konfirmasi kata sandi" />

            <Form {...store.form()} resetOnSuccess={['password']} className="grid gap-5">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-1.5">
                            <Label htmlFor="password" className="font-semibold text-navy">Kata sandi</Label>
                            <PasswordInput id="password" name="password" placeholder="Kata sandi Anda" autoComplete="current-password" autoFocus />
                            <InputError message={errors.password} />
                        </div>
                        <Button size="lg" className="w-full" disabled={processing} data-test="confirm-password-button">
                            {processing && <Spinner />}
                            Konfirmasi
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

ConfirmPassword.layout = {
    title: 'Konfirmasi kata sandi',
    description: 'Ini area aman. Konfirmasi kata sandi Anda sebelum melanjutkan.',
};
