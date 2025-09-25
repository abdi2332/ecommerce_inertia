<?php

namespace App\Http\Controllers;

use App\Events\CartUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use App\Models\Product;
use Inertia\Inertia;
use App\Services\CartService;

class CartController extends Controller
{
    protected $cartService;
    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    public function add(Request $request)
    {
        $this->cartService->addItem(
            session()->getId(),
            $productId = $request->input('product_id'),
            $change = (int) $request->input('change', 1),
        );
        
        return Inertia::render('Welcome');
    }


    public function updateItem(Request $request)
    {


   
        $this->cartService->updateQuantity(
            session()->getId(),
            $productId = $request->input('product_id'),
            $change = (int) $request->input('change'),
        );

        
        return Inertia::render('Welcome');
    }


    public function removeItem(Request $request){

        $this->cartService->removeItem(
            session()->getId(),
            $productId = $request->input('product_id'),
        );

        
        return Inertia::render('Welcome');

    }


    // old code that are below this are that I am keeping for reference would be deleted later
    protected function getCartIdentifier()
    {
        // Use user ID if authenticated, session ID if guest
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

   
}