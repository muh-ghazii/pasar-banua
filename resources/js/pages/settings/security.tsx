import { Form, Head } from '@inertiajs/react';
import { useRef } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import PasswordInput from '@/components/password-input';
import FormField from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export default function Security({ passwordRules }: { passwordRules: string }) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <>
            <Head title="Keamanan" />

            <section>
                <h2 className="font-heading text-xl font-bold text-navy">Ubah kata sandi</h2>
                <p className="mt-1 mb-5 text-sm text-muted-foreground">
                    Gunakan kata sandi yang panjang dan sulit ditebak agar akun Anda tetap aman.
                </p>

                <Form
                    {...SecurityController.update.form()}
                    options={{ preserveScroll: true }}
                    resetOnError={['password', 'password_confirmation', 'current_password']}
                    resetOnSuccess
                    onError={(errors) => {
                        if (errors.password) {
                            passwordInput.current?.focus();
                        }

                        if (errors.current_password) {
                            currentPasswordInput.current?.focus();
                        }
                    }}
                    className="grid gap-5"
                >
                    {({ errors, processing }) => (
                        <>
                            <FormField label="Kata sandi saat ini" htmlFor="current_password" error={errors.current_password}>
                                <PasswordInput id="current_password" ref={currentPasswordInput} name="current_password" autoComplete="current-password" />
                            </FormField>
                            <FormField label="Kata sandi baru" htmlFor="password" error={errors.password}>
                                <PasswordInput id="password" ref={passwordInput} name="password" autoComplete="new-password" passwordrules={passwordRules} />
                            </FormField>
                            <FormField label="Ulangi kata sandi baru" htmlFor="password_confirmation" error={errors.password_confirmation}>
                                <PasswordInput id="password_confirmation" name="password_confirmation" autoComplete="new-password" passwordrules={passwordRules} />
                            </FormField>
                            <div>
                                <Button disabled={processing} data-test="update-password-button">
                                    {processing && <Spinner />}
                                    Simpan kata sandi
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </section>
        </>
    );
}
