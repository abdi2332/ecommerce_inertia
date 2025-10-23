<?php

namespace App\Listeners;

use App\Events\TestSync;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Redis;
use App\Services\CartService;
use App\Events\CartSynced;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class MergeGuestCartOnLogin 
{
    protected $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    // MergeGuestCartOnLogin listener
    public function handle(Login $event)
    {
        $user = $event->user;
         $oldSessionId = session('guest_session_id'); 
         $guestCart = Redis::hgetall("cart:{$oldSessionId}");

        $guestCart = Redis::hgetall("cart:{$oldSessionId}");

        $userCartKey = "cart:{$user->id}";

        foreach ($guestCart as $productId => $qty) {
            Redis::hincrby($userCartKey, $productId, $qty);
        }
        logger('Merging guest cart into user cart for user ID: ' . $user->id);

        Redis::expire($userCartKey, 86400);
        Redis::del("cart:{$oldSessionId}");


        
        
    }

}
