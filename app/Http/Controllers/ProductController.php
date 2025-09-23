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
    $cartWithDetails = [];

    // Only attempt to fetch cart if user is logged in and Redis is available
    if ($userId && class_exists('Redis')) {
        $cart = Redis::hgetall($this->cartKey($userId)) ?: [];

        if (!empty($cart)) {
            $productsInCart = Product::whereIn('id', array_keys($cart))->get();
            $cartWithDetails = $productsInCart->map(function ($product) use ($cart) {
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

    // Fetch all products for display
    $products = Product::with('category', 'images')->get();

    return Inertia::render('Welcome', [
        'products' => $products,
        'cartItem' => $cartWithDetails, // empty array if no cart
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'auth' => [
            'user' => auth()->user() ? [
                'id' => $userId,
                'name' => auth()->user()->name,
                'email' => auth()->user()->email,
            ] : null,
        ],
    ]);
}


}