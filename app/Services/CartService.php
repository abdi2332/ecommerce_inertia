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
public function addItem($sessionId, $productId, $quantity = 1)
    {
        $newQty = Redis::hincrby("cart:{$sessionId}", $productId, $quantity);
        Redis::expire("cart:{$sessionId}", 86400); // 24h expiration

        broadcast(new CartItemAdded($sessionId, $productId, $newQty, $this->getProductData($productId)));

        // this is the broadcast for stock update on checkout because we want to update stock only when user checkout because user can add to cart but not buy
        // $sessionId = session()->getId(); // get current session ID

        // $oldStock = Product::where('id', $productId)->value('stock');

        // if ($oldStock !== null) {
        //     $newStock = max(0, $oldStock - $quantity); 
        //     Product::where('id', $productId)->update(['stock' => $newStock]);

        //     logger('Stock updated for product ' . $productId . ': ' . $oldStock . ' -> ' . $newStock);

        //     broadcast(new StockUpdated($newStock, $productId));

        // }
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

    protected function getCartIdentifier()
    {
        $user = auth()->check() ? auth()->id() : session()->getId();

        return "cart:{$user}";
    }

    protected function getCartData($identifier)
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