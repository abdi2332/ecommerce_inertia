<?php
namespace App\Services;
use Illuminate\Support\Facades\Redis;
use App\Events\CartItemAdded;
use App\Models\Product;
use App\Events\CartItemUpdated;
use App\Events\CartItemRemoved;

class CartService
{
public function addItem($sessionId, $productId, $quantity = 1)
    {
        $newQty = Redis::hincrby("cart:{$sessionId}", $productId, $quantity);
        Redis::expire("cart:{$sessionId}", 86400); // 24h expiration

        broadcast(new CartItemAdded($sessionId, $productId, $newQty, $this->getProductData($productId)));

        $sessionId = session()->getId(); // get current session ID

        return $newQty;
    }

    public function updateQuantity($sessionId, $productId, $quantity)
    {
        $newQty = Redis::hincrby("cart:{$sessionId}", $productId, $quantity);

        if ($newQty <= 0) {
            Redis::hdel("cart:{$sessionId}", $productId);

            broadcast(new CartItemRemoved($sessionId, $productId));
            $newQty = 0;
        }
    
    broadcast(new CartItemUpdated( $sessionId, $productId, $newQty));

        return $newQty;
    }

    public function removeItem($sessionId, $productId){
        Redis::hdel("cart:{$sessionId}", $productId);

        broadcast( new CartItemRemoved( $sessionId, $productId));
    }

    public function getProductData($productId)
    {
        $product = Product::find($productId);
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