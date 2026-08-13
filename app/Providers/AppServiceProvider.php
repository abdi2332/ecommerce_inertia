<?php

namespace App\Providers;

use App\Services\CartService;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(CartService::class, function ($app) {
            return new CartService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (config('app.env') !== 'local' || str_contains(config('app.url'), 'https://')) {
            URL::forceScheme('https');
        }

        Inertia::share([
            'cart' => function () {
                $cartService = app(CartService::class);
                return $cartService->getCartData($cartService->getCartIdentifier());
            },
            'identifier' => fn () => auth()->id() ?? session()->getId(),
        ]);

        Vite::prefetch(concurrency: 3);
    }
}