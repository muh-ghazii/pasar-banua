import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
    passwordRules: string;
};

export default function ResetPassword({ token, email, passwordRules }: Props) {
    return (
        <>
            <Head title="Atur ulang kata sandi" />

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
                className="grid gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-1.5">
                            <Label htmlFor="email" className="font-semibold text-navy">Email</Label>
                            <Input id="email" type="email" name="email" autoComplete="email" value={email} readOnly />
                            <InputError message={errors.email} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="password" className="font-semibold text-navy">Kata sandi baru</Label>
                            <PasswordInput id="password" name="password" autoComplete="new-password" autoFocus placeholder="Minimal 8 karakter" passwordrules={passwordRules} />
                            <InputError message={errors.password} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="password_confirmation" className="font-semibold text-navy">Ulangi kata sandi baru</Label>
                            <PasswordInput id="password_confirmation" name="password_confirmation" autoComplete="new-password" placeholder="Ketik ulang kata sandi" passwordrules={passwordRules} />
                            <InputError message={errors.password_confirmation} />
                        </div>
                        <Button type="submit" size="lg" className="w-full" disabled={processing} data-test="reset-password-button">
                            {processing && <Spinner />}
                            Simpan kata sandi baru
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

ResetPassword.layout = {
    title: 'Atur ulang kata sandi',
    description: 'Buat kata sandi baru untuk akun Anda.',
};
