<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use App\Services\CartService;
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
    public function boot(CartService $cartService): void
    {
        Inertia::share([
            'cart' => fn () => $cartService->getCartData($cartService->getCartIdentifier()),
            'identifier' => fn () => auth()->id()? auth()->id():  session()->getId(),
            'csrfToken' => fn () => csrf_token(),

        ]);
        Vite::prefetch(concurrency: 3);
    }
}
