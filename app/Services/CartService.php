<?php

namespace App\Services;
use Illuminate\Support\Facades\Redis;


class CartService
{
    public function addItem($sessionId, $productId, $quantity = 1)
    {
        $newQty = Redis::hincrby("cart:{$sessionId}", $productId, $quantity);
        Redis::expire("cart:{$sessionId}", 86400); // 24h expiration
        
        broadcast(new CartItemAdded($sessionId, $productId, $newQty, $this->getProductData($productId)));
        return $newQty;
    }

    public function updateQuantity($sessionId, $productId, $change)
    {
        $newQty = Redis::hincrby("cart:{$sessionId}", $productId, $change);
        
        if ($newQty <= 0) {
            Redis::hdel("cart:{$sessionId}", $productId);
            broadcast(new CartItemRemoved($sessionId, $productId));
            return 0;
        }
        
        broadcast(new CartItemUpdated($sessionId, $productId, $newQty));
        return $newQty;
    }

    public function removeItem($sessionId, $productId)
    {
        Redis::hdel("cart:{$sessionId}", $productId);
        broadcast(new CartItemRemoved($sessionId, $productId));
    }

    public function clearCart($sessionId)
    {
        Redis::del("cart:{$sessionId}");
        broadcast(new CartCleared($sessionId));
    }

    public function getCart($sessionId)
    {
        $cart = Redis::hgetall("cart:{$sessionId}");
        return empty($cart) ? [] : $this->enrichWithProductData($cart);
    }
}