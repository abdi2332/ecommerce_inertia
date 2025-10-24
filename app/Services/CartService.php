<?php
namespace App\Services;
use App\Events\StockUpdated;
use Illuminate\Support\Facades\Redis;
use App\Events\CartItemAdded;
use App\Models\Product;
use App\Events\CartItemUpdated;
use App\Events\CartItemRemoved;

class CartService
{


public function addItem($identifier, $productId, $quantity = 1)
    {
        $newQty = Redis::hincrby("cart:{$identifier}", $productId, $quantity);
        Redis::expire("cart:{$identifier}", 86400); // 24h expiration

        broadcast(new CartItemAdded($identifier, $productId, $newQty, $this->getProductData($productId), $this->isAuthenticated()));
        // broadcast(new \App\Events\CartSynced(1, ['item'=>1], true));

        // this is the broadcast for stock update on checkout because we want to update stock only when user checkout because user can add to cart but not buy
        // $identifier = session()->getId(); // get current session ID

        // $oldStock = Product::where('id', $productId)->value('stock');

        // if ($oldStock !== null) {
        //     $newStock = max(0, $oldStock - $quantity); 
        //     Product::where('id', $productId)->update(['stock' => $newStock]);

        //     logger('Stock updated for product ' . $productId . ': ' . $oldStock . ' -> ' . $newStock);

        //     broadcast(new StockUpdated($newStock, $productId));

        // }
        return $newQty;
    }

    public function updateQuantity($identifier, $productId, $quantity)
    {
        $newQty = Redis::hincrby("cart:{$identifier}", $productId, $quantity);

        if ($newQty <= 0) {
            Redis::hdel("cart:{$identifier}", $productId);

            broadcast(new CartItemRemoved($identifier, $productId, $this->isAuthenticated()));
            // simple payload

            $newQty = 0;
        }
    
    broadcast(new CartItemUpdated( $identifier, $productId, $newQty,$this->isAuthenticated()));

        return $newQty;
    }

    public function removeItem($identifier, $productId){
        Redis::hdel("cart:{$identifier}", $productId);

        broadcast( new CartItemRemoved( $identifier, $productId,$this->isAuthenticated()));
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

    public function clearCart($identifier = null)
    {
        // Determine cart identifier: either provided or current user/session
        $identifier = $identifier ?? $this->getCartIdentifier();
    
        // Remove all items from Redis
        Redis::del($identifier);
    
        // Check if it’s really gone
        $cart = Redis::get($identifier);
    
        logger('Cart cleared: ' . $identifier);
        logger('Cart contents after clear: ' . ($cart ?? 'EMPTY'));
    
        // Optional: broadcast cart-cleared event if frontend listens
        // broadcast(new CartItemRemoved($identifier, null, $this->isAuthenticated()));
    
        logger("Cart cleared for identifier: {$identifier}");
    }
    


    public function getCartIdentifier()
    {
        $user = auth()->check() ? auth()->id() : session()->getId();

        return "cart:{$user}";
    }

    protected function isAuthenticated():bool {
        return auth()->check();
    }

    public function getCartData($identifier)
    {
        $cart = Redis::hgetall($identifier);

        if (empty($cart)) {
            return [];
        }

        $products = Product::whereIn('id', array_keys($cart))->get();

        return $products->map(function ($product) use ($cart) {
            $qty = (int) $cart[$product->id];
            return [
                'id' => $product->id,
                'name' => $product->name,
                'price' => $product->price,
                'qty' => $qty,
                'subtotal' => $product->price * $qty,
            ];
        });
    }
 
}