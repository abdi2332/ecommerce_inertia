<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Inertia\Inertia;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Redis;


class ProductController extends Controller
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

         $products = Product::with('category', 'images')->get();

    return Inertia::render('Welcome', [
        'products' => $products,
        'cartItem' => $cartWithDetails,
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'auth' => [
            'user' => auth()->user() ? [
                'id' => auth()->id(),
                'name' => auth()->user()->name,
                'email' => auth()->user()->email,
            ] : null,
        ],
    ]);
}

}