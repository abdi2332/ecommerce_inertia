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
    protected function getCartIdentifier()
    {
        // Use user ID if authenticated, session ID if guest
        return auth()->check() ? auth()->id() : session()->getId();
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

        return Inertia::render('Welcome', ['cartItem' => $cartData]);
    }

    public function update(Request $request)
    {
        $identifier = $this->getCartIdentifier();
        $productId = $request->input('product_id');
        $change = (int) $request->input('change', 1);

        $product = Product::find($productId);

        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $qty = Redis::hincrby($this->cartKey($identifier), $productId, $change);

        if ($qty <= 0) {
            Redis::hdel($this->cartKey($identifier), $productId);
        }

        Redis::expire($this->cartKey($identifier), 86400);
        
        // Get updated cart data and broadcast
        $cartData = $this->getCartData($identifier);
        broadcast(new CartUpdated(session()->getId(), $cartData))->toOthers();

        return response()->json(['success' => true, 'cart' => $cartData]);
    }

    public function remove(Request $request)
    {
        $identifier = $this->getCartIdentifier();
        $productId = $request->input('product_id');

        Redis::hdel($this->cartKey($identifier), $productId);
        
        // Get updated cart data and broadcast
        $cartData = $this->getCartData($identifier);
        broadcast(new CartUpdated(session()->getId(), $cartData))->toOthers();

        return response()->json(['success' => true, 'cart' => $cartData]);
    }

    public function clear()
    {
        $identifier = $this->getCartIdentifier();
        Redis::del($this->cartKey($identifier));
        
        // Broadcast empty cart
        broadcast(new CartUpdated(session()->getId(), []))->toOthers();
        
        return response()->json(['success' => true, 'cart' => []]);
    }
}