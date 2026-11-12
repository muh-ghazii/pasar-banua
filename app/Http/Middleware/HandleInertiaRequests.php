<?php

namespace App\Http\Middleware;

use App\Enums\OrderStatus;
use App\Enums\ProductStatus;
use App\Enums\UmkmStatus;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\UmkmProfile;
use App\Models\User;
use App\Services\CartService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? $this->userPayload($user) : null,
            ],
            'cartCount' => fn () => app(CartService::class)->count($user),
            'navCategories' => fn () => Cache::remember('nav.categories', 300, fn () => Category::active()
                ->ordered()
                ->get(['id', 'name', 'slug', 'icon'])
                ->map(fn (Category $c) => ['id' => $c->id, 'name' => $c->name, 'slug' => $c->slug, 'icon' => $c->icon])
                ->all()),
            'notifications' => fn () => $user ? [
                'unread' => $user->unreadNotifications()->count(),
                'items' => $user->notifications()->latest()->limit(6)->get()->map(fn ($n) => [
                    'id' => $n->id,
                    'title' => $n->data['title'] ?? '',
                    'message' => $n->data['message'] ?? '',
                    'url' => $n->data['url'] ?? null,
                    'tone' => $n->data['tone'] ?? 'info',
                    'read' => $n->read_at !== null,
                    'created_at' => $n->created_at?->toIso8601String(),
                ])->all(),
            ] : null,
            'sidebarBadges' => fn () => $this->sidebarBadges($user),
            'app' => [
                'demo' => (bool) config('pasarbanua.demo'),
                'contact' => config('pasarbanua.contact'),
                'social' => config('pasarbanua.social'),
                'shippingFlat' => (int) config('pasarbanua.shipping_flat'),
            ],
        ];
    }

    /**
     * Penghitung kecil di sidebar dashboard (pekerjaan yang menunggu).
     *
     * @return array<string, int>
     */
    private function sidebarBadges(?User $user): array
    {
        if ($user?->isSeller() && $user->umkmProfile) {
            return [
                'orders' => Order::where('umkm_profile_id', $user->umkmProfile->id)
                    ->where('status', OrderStatus::Pending)
                    ->count(),
            ];
        }

        if ($user?->isAdmin()) {
            return [
                'umkm' => UmkmProfile::where('status', UmkmStatus::Pending)->count(),
                'products' => Product::where('status', ProductStatus::Pending)->count(),
            ];
        }

        return [];
    }

    /**
     * @return array<string, mixed>
     */
    private function userPayload(User $user): array
    {
        $umkm = $user->isSeller() ? $user->umkmProfile : null;

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role->value,
            'role_label' => $user->role->label(),
            'home_path' => $user->role->homePath(),
            'umkm' => $umkm ? [
                'id' => $umkm->id,
                'name' => $umkm->name,
                'slug' => $umkm->slug,
                'status' => $umkm->status->value,
                'status_label' => $umkm->status->label(),
                'logo_url' => $umkm->logoUrl(),
            ] : null,
        ];
    }
}
