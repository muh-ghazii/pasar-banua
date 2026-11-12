import { Form, Head, usePage } from '@inertiajs/react';
import { useRef } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import FormField from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

export default function Profile({ canDelete }: { canDelete: boolean }) {
    const { auth } = usePage().props;
    const user = auth.user!;
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        <>
            <Head title="Profil" />

            <section>
                <h2 className="font-heading text-xl font-bold text-navy">Profil</h2>
                <p className="mt-1 mb-5 text-sm text-muted-foreground">Perbarui nama, email, dan nomor telepon Anda.</p>

                <Form {...ProfileController.update.form()} options={{ preserveScroll: true }} className="grid gap-5">
                    {({ processing, errors }) => (
                        <>
                            <FormField label="Nama lengkap" htmlFor="name" error={errors.name}>
                                <Input id="name" name="name" defaultValue={user.name} required autoComplete="name" aria-invalid={!!errors.name} />
                            </FormField>
                            <FormField label="Email" htmlFor="email" error={errors.email}>
                                <Input id="email" type="email" name="email" defaultValue={user.email} required autoComplete="username" aria-invalid={!!errors.email} />
                            </FormField>
                            <FormField label="Nomor telepon" htmlFor="phone" error={errors.phone} hint="Dipakai untuk menghubungi Anda terkait pesanan.">
                                <Input id="phone" type="tel" name="phone" defaultValue={user.phone ?? ''} autoComplete="tel" placeholder="08xxxxxxxxxx" aria-invalid={!!errors.phone} />
                            </FormField>
                            <div>
                                <Button disabled={processing} data-test="update-profile-button">
                                    {processing && <Spinner />}
                                    Simpan perubahan
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </section>

            {canDelete && (
                <section className="rounded-2xl border border-brick/20 bg-brick-100/50 p-5">
                    <h2 className="font-heading text-lg font-bold text-brick">Hapus akun</h2>
                    <p className="mt-1 mb-4 text-sm text-pretty text-navy/80">
                        Akun dan datanya akan dihapus permanen. Akun yang sudah memiliki riwayat pesanan tidak dapat dihapus.
                    </p>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="destructive" data-test="delete-user-button">Hapus akun</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <Form
                                {...ProfileController.destroy.form()}
                                options={{ preserveScroll: true }}
                                onError={() => passwordInput.current?.focus()}
                                resetOnSuccess
                                className="grid gap-5"
                            >
                                {({ resetAndClearErrors, processing, errors }) => (
                                    <>
                                        <DialogHeader>
                                            <DialogTitle className="font-heading font-bold text-navy">Yakin ingin menghapus akun?</DialogTitle>
                                            <DialogDescription>Masukkan kata sandi untuk mengonfirmasi penghapusan akun.</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="delete-password" className="sr-only">Kata sandi</Label>
                                            <PasswordInput id="delete-password" name="password" ref={passwordInput} placeholder="Kata sandi" autoComplete="current-password" />
                                            <InputError message={errors.password} />
                                        </div>
                                        <DialogFooter className="gap-2">
                                            <DialogClose asChild>
                                                <Button type="button" variant="outline" onClick={() => resetAndClearErrors()}>Batal</Button>
                                            </DialogClose>
                                            <Button variant="destructive" disabled={processing} asChild>
                                                <button type="submit" data-test="confirm-delete-user-button">Hapus akun</button>
                                            </Button>
                                        </DialogFooter>
                                    </>
                                )}
                            </Form>
                        </DialogContent>
                    </Dialog>
                </section>
            )}
        </>
    );
}
