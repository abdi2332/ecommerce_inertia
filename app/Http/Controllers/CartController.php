<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use App\Models\Product;
use Inertia\Inertia;

class CartController extends Controller
{
    
   protected function cartkey($userId): string
   {
       return "cart:{$userId}";
   }

   public function index()
    {
        $userId = auth()->id();
        $cart = Redis::hgetall($this->cartKey($userId));

        if (empty($cart)) {
            return response()->json(['cart' => []]);
        }

        $products = Product::whereIn('id', array_keys($cart))->get();

        $cartWithDetails = $products->map(function ($product) use ($cart) {
            $qty = (int) $cart[$product->id];
            return [
                'id' => $product->id,
                'name' => $product->name,
                'price' => $product->price,
                'qty' => $qty,
                'subtotal' => $product->price * $qty,
            ];
        });
        

        return inertia::render('Welcome', ['cartItem' => $cartWithDetails]);
    }

    public function update(Request $request)
    {
         $userId = auth()->id();
        $productId = $request->input('product_id');
        $change = (int) $request->input('change', 1);

        $product = Product::find($productId);

        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $qty = Redis::hincrby($this->cartKey($userId), $productId, $change);

        if ($qty <= 0) {
            Redis::hdel($this->cartKey($userId), $productId);
        }

        Redis::expire($this->cartKey($userId), 86400); 

        return $this->index();
    }

    public function remove(Request $request){

        $userId = auth()->id();
        $productId = $request->input('product_id');

        Redis::hdel($this->cartKey($userId), $productId);

        return $this->index();
    }

    public function clear(){
        $userId = auth()->id();
        Redis::del($this->cartKey($userId));
        return response()->json(['cart' => []]);
    }
        
}
 