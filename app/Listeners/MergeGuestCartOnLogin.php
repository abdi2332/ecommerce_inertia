<?php

namespace App\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Redis;
use App\Services\CartService;

class MergeGuestCartOnLogin
{
    protected $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    public function handle(Login $event)
    {
        $user = $event->user;
        logger("User logged in: " . $user->id);
        $sessionId = session()->getId();

        $guestCart = Redis::hgetall("cart:{$sessionId}");
        $userCartKey = "cart:{$user->id}";

        foreach ($guestCart as $productId => $qty) {
            Redis::hincrby($userCartKey, $productId, $qty);
        }

        // // Optional: expire after 24h
        // Redis::expire($userCartKey, 86400);

        // Remove guest cart
        Redis::del("cart:{$sessionId}");

        // Broadcast updated cart to all user sessions
        broadcast(new \App\Events\CartUpdated($user->id, $this->cartService->getCartData($userCartKey)));
    }
}
