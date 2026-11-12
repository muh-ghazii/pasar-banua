<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\UmkmStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReasonRequest;
use App\Http\Requests\Admin\UpdateUmkmRequest;
use App\Models\UmkmProfile;
use App\Notifications\AppNotification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UmkmController extends Controller
{
    public function index(Request $request): Response
    {
        $status = UmkmStatus::tryFrom((string) $request->query('status'));
        $search = trim((string) $request->query('q', ''));

        $counts = UmkmProfile::query()->selectRaw('status, COUNT(*) as total')->groupBy('status')->pluck('total', 'status');

        $umkms = UmkmProfile::query()
            ->with('user:id,name,email,is_active')
            ->withCount(['products', 'orders'])
            ->when($status, fn (Builder $q) => $q->where('status', $status))
            ->when($search !== '', function (Builder $q) use ($search) {
                $term = '%'.addcslashes($search, '\\%_').'%';
                $q->where(fn (Builder $w) => $w->where('name', 'like', $term)
                    ->orWhere('city', 'like', $term)
                    ->orWhereHas('user', fn (Builder $u) => $u->where('name', 'like', $term)->orWhere('email', 'like', $term)));
            })
            // Antrean verifikasi tampil paling atas.
            ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (UmkmProfile $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'slug' => $u->slug,
                'city' => $u->city,
                'status' => $u->status->value,
                'logo_url' => $u->logoUrl(),
                'owner' => $u->user ? ['name' => $u->user->name, 'email' => $u->user->email, 'is_active' => $u->user->is_active] : null,
                'products_count' => (int) $u->products_count,
                'orders_count' => (int) $u->orders_count,
                'is_demo' => $u->is_demo,
                'created_at' => $u->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/umkm-index', [
            'umkms' => $umkms,
            'filters' => ['status' => $status?->value, 'q' => $search],
            'counts' => collect(UmkmStatus::cases())->mapWithKeys(fn ($s) => [$s->value => (int) ($counts[$s->value] ?? 0)])->all()
                + ['all' => (int) $counts->sum()],
        ]);
    }

    public function show(UmkmProfile $umkm): Response
    {
        $umkm->load('user:id,name,email,phone,is_active,created_at');

        $products = $umkm->products()
            ->with(['images', 'category:id,name,slug,icon'])
            ->latest()
            ->limit(12)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'price' => $p->price,
                'stock' => $p->stock,
                'status' => $p->status->value,
                'is_active' => $p->is_active,
                'image_url' => $p->images->first()?->url(),
                'category_slug' => $p->category?->slug,
                'category_icon' => $p->category?->icon,
            ]);

        $revenue = (int) $umkm->orders()->where('status', '!=', OrderStatus::Cancelled->value)->sum('total');

        return Inertia::render('admin/umkm-show', [
            'umkm' => [
                'id' => $umkm->id,
                'name' => $umkm->name,
                'slug' => $umkm->slug,
                'tagline' => $umkm->tagline,
                'description' => $umkm->description,
                'story' => $umkm->story,
                'city' => $umkm->city,
                'address' => $umkm->address,
                'phone' => $umkm->phone,
                'whatsapp' => $umkm->whatsapp,
                'instagram' => $umkm->instagram,
                'logo_url' => $umkm->logoUrl(),
                'cover_url' => $umkm->coverUrl(),
                'status' => $umkm->status->value,
                'verified_at' => $umkm->verified_at?->toIso8601String(),
                'rejection_reason' => $umkm->rejection_reason,
                'is_demo' => $umkm->is_demo,
                'created_at' => $umkm->created_at?->toIso8601String(),
                'owner' => $umkm->user ? [
                    'id' => $umkm->user->id,
                    'name' => $umkm->user->name,
                    'email' => $umkm->user->email,
                    'phone' => $umkm->user->phone,
                    'is_active' => $umkm->user->is_active,
                    'created_at' => $umkm->user->created_at?->toIso8601String(),
                ] : null,
            ],
            'products' => $products,
            'stats' => [
                'products' => $umkm->products()->count(),
                'products_published' => $umkm->products()->published()->count(),
                'orders' => $umkm->orders()->count(),
                'orders_pending' => $umkm->orders()->where('status', OrderStatus::Pending)->count(),
                'revenue' => $revenue,
            ],
        ]);
    }

    public function update(UpdateUmkmRequest $request, UmkmProfile $umkm): RedirectResponse
    {
        $data = $request->validated();
        $data['instagram'] = filled($data['instagram'] ?? null) ? ltrim($data['instagram'], '@') : null;

        $umkm->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Informasi UMKM diperbarui.']);

        return back();
    }

    public function approve(UmkmProfile $umkm): RedirectResponse
    {
        $umkm->update([
            'status' => UmkmStatus::Approved,
            'verified_at' => $umkm->verified_at ?? now(),
            'rejection_reason' => null,
        ]);

        $this->notifyOwner($umkm, 'UMKM Anda terverifikasi', "Selamat! {$umkm->name} kini terverifikasi. Produk yang disetujui akan tampil di Pasar Banua.", 'success');

        return $this->done("{$umkm->name} berhasil diverifikasi.");
    }

    public function reject(ReasonRequest $request, UmkmProfile $umkm): RedirectResponse
    {
        $reason = $request->validated('reason');

        $umkm->update([
            'status' => UmkmStatus::Rejected,
            'verified_at' => null,
            'rejection_reason' => $reason,
        ]);

        $this->notifyOwner($umkm, 'Pendaftaran UMKM ditolak', "Pendaftaran {$umkm->name} belum dapat disetujui. Alasan: {$reason}", 'danger');

        return $this->done("Pendaftaran {$umkm->name} ditolak.");
    }

    public function suspend(ReasonRequest $request, UmkmProfile $umkm): RedirectResponse
    {
        abort_unless($umkm->status === UmkmStatus::Approved, 422, 'Hanya UMKM terverifikasi yang dapat dinonaktifkan.');

        $reason = $request->validated('reason');

        $umkm->update([
            'status' => UmkmStatus::Suspended,
            'rejection_reason' => $reason,
        ]);

        $this->notifyOwner($umkm, 'UMKM dinonaktifkan sementara', "Toko {$umkm->name} dinonaktifkan sementara sehingga produknya tidak tampil. Alasan: {$reason}", 'warning');

        return $this->done("{$umkm->name} dinonaktifkan. Produknya tidak lagi tampil di katalog.");
    }

    public function reactivate(UmkmProfile $umkm): RedirectResponse
    {
        abort_unless($umkm->status === UmkmStatus::Suspended, 422, 'UMKM ini tidak sedang dinonaktifkan.');

        $umkm->update([
            'status' => UmkmStatus::Approved,
            'rejection_reason' => null,
            'verified_at' => $umkm->verified_at ?? now(),
        ]);

        $this->notifyOwner($umkm, 'UMKM aktif kembali', "Toko {$umkm->name} kembali aktif di Pasar Banua.", 'success');

        return $this->done("{$umkm->name} diaktifkan kembali.");
    }

    private function notifyOwner(UmkmProfile $umkm, string $title, string $message, string $tone): void
    {
        $umkm->loadMissing('user');
        $umkm->user?->notify(new AppNotification($title, $message, '/seller', $tone));
    }

    private function done(string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => 'success', 'message' => $message]);

        return back();
    }
}
