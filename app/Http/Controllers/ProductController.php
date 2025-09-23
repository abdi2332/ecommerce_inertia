<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Inertia\Inertia;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Redis;

class ProductController extends Controller
{
    protected function getCartIdentifier()
    {
        return auth()->check() ? auth()->id() : session()->getId();
    }

    protected function cartkey($identifier): string
    {
        $prefix = auth()->check() ? "cart:user:" : "cart:session:";
        return $prefix . $identifier;
    }

    protected function getCartData($identifier)
    {
        $cart = Redis::hgetall($this->cartKey($identifier));

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

    public function index()
    {
        $identifier = $this->getCartIdentifier();
        $cartData = $this->getCartData($identifier);
        $sessionId = session()->getId();
        
        $products = Product::with('category', 'images')->get();

        return Inertia::render('Welcome', [
            'cartItem' => $cartData,
            'sessionId' => $sessionId,
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