<?php

namespace App\Providers;

use App\Models\User;
use App\Services\CartService;
use App\Services\OrderService;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Login;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->scoped(CartService::class);
        $this->app->scoped(OrderService::class);
    }

    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureAuthorization();
        $this->configureRateLimiting();

        // Keranjang tamu digabung ke keranjang pengguna saat login/registrasi.
        Event::listen(Login::class, function (Login $event): void {
            if ($event->user instanceof User) {
                app(CartService::class)->mergeGuestCart($event->user);
            }
        });
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(10)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->uncompromised()
            : Password::min(8),
        );
    }

    protected function configureAuthorization(): void
    {
        Gate::define('access-admin', fn (User $user): bool => $user->isAdmin());
        Gate::define('access-seller', fn (User $user): bool => $user->isSeller() && $user->umkmProfile !== null);
    }

    protected function configureRateLimiting(): void
    {
        RateLimiter::for('checkout', fn (Request $request) => Limit::perMinute(10)->by($request->user()?->id ?: $request->ip()));
        RateLimiter::for('cart', fn (Request $request) => Limit::perMinute(60)->by($request->user()?->id ?: $request->ip()));
        RateLimiter::for('uploads', fn (Request $request) => Limit::perMinute(30)->by($request->user()?->id ?: $request->ip()));
        RateLimiter::for('reviews', fn (Request $request) => Limit::perMinute(10)->by($request->user()?->id ?: $request->ip()));
    }
}
