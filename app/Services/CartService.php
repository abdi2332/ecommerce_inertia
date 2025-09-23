<?php
namespace App\Services;
use Illuminate\Support\Facades\Redis;
use App\Events\CartItemAdded;

class CartService
{
    public function addItem($sessionId, $productId, $quantity = 1)
    {
        $newQty = Redis::hincrby("cart:{$sessionId}", $productId, $quantity);
        Redis::expire("cart:{$sessionId}", 86400); // 24h expiration
        
        broadcast(new CartItemAdded($sessionId, $productId, $newQty, $this->getProductData($productId)));
        return $newQty;
    }

    public function getProductData($productId)
    {
        $product = \App\Models\Product::find($productId);
        if (!$product) {
            return null;
        }
        return [
            'id' => $product->id,
            'name' => $product->name,
            'price' => $product->price,
            'image' => $product->images->first() ? $product->images->first()->url : null,
        ];
    

    }
 
}