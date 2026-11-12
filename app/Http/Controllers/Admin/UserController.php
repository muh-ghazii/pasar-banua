<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\AppNotification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $role = Role::tryFrom((string) $request->query('role'));
        $search = trim((string) $request->query('q', ''));
        $state = in_array($request->query('status'), ['aktif', 'nonaktif'], true) ? (string) $request->query('status') : null;

        $counts = User::query()->selectRaw('role, COUNT(*) as total')->groupBy('role')->pluck('total', 'role');

        $users = User::query()
            ->with('umkmProfile:id,user_id,name,status')
            ->withCount('orders')
            ->when($role, fn (Builder $q) => $q->where('role', $role))
            ->when($state, fn (Builder $q) => $q->where('is_active', $state === 'aktif'))
            ->when($search !== '', function (Builder $q) use ($search) {
                $term = '%'.addcslashes($search, '\\%_').'%';
                $q->where(fn (Builder $w) => $w->where('name', 'like', $term)->orWhere('email', 'like', $term));
            })
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone,
                'role' => $u->role->value,
                'role_label' => $u->role->label(),
                'is_active' => $u->is_active,
                'is_demo' => $u->is_demo,
                'orders_count' => (int) $u->orders_count,
                'umkm' => $u->umkmProfile ? ['id' => $u->umkmProfile->id, 'name' => $u->umkmProfile->name, 'status' => $u->umkmProfile->status->value] : null,
                'created_at' => $u->created_at?->toIso8601String(),
                'can_toggle' => $this->canToggle($request->user(), $u),
            ]);

        return Inertia::render('admin/users', [
            'users' => $users,
            'filters' => ['role' => $role?->value, 'q' => $search, 'status' => $state],
            'counts' => collect(Role::cases())->mapWithKeys(fn ($r) => [$r->value => (int) ($counts[$r->value] ?? 0)])->all()
                + ['all' => (int) $counts->sum()],
        ]);
    }

    public function toggleActive(Request $request, User $user): RedirectResponse
    {
        abort_unless($this->canToggle($request->user(), $user), 403, 'Akun admin tidak dapat dinonaktifkan dari panel ini.');

        $user->is_active = ! $user->is_active;
        $user->save();

        if (! $user->is_active) {
            // Putuskan sesi aktif pengguna (session driver database).
            if (config('session.driver') === 'database') {
                DB::table(config('session.table', 'sessions'))->where('user_id', $user->id)->delete();
            }
        } else {
            $user->notify(new AppNotification('Akun aktif kembali', 'Akun Pasar Banua Anda telah diaktifkan kembali oleh admin.', null, 'success'));
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $user->is_active ? "Akun {$user->name} diaktifkan." : "Akun {$user->name} dinonaktifkan dan sesinya diakhiri.",
        ]);

        return back();
    }

    private function canToggle(User $actor, User $target): bool
    {
        return $actor->id !== $target->id && ! $target->isAdmin();
    }
}
