<?php

namespace App\Http\Controllers;

use App\Services\CartService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use Inertia\Inertia;

class CartController extends Controller
{
    protected $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    protected function getIdentifier()
    {
        return auth()->check() ? auth()->id() : session()->getId();
    }

    public function add(Request $request)
    {
        $identifier = $this->getIdentifier();
        $productId = $request->input('product_id');
        $change = (int) $request->input('change', 1);

        logger($request->all());

        if (Redis::hexists('cart:' . $identifier, $productId)) {
            logger('updating existing item in cart');
            $this->cartService->updateQuantity($identifier, $productId, $change);
        } else {
            logger('adding new item to cart');
            $this->cartService->addItem($identifier, $productId, $change);
        }

        return response()->noContent();
    }

    public function updateItem(Request $request)
    {
        $identifier = $this->getIdentifier();
        $productId = $request->input('product_id');
        $change = (int) $request->input('change');

        logger($request->all());

        $this->cartService->updateQuantity($identifier, $productId, $change);

         return response()->noContent();
    }

    public function removeItem(Request $request)
    {
        $identifier = $this->getIdentifier();
        $productId = $request->input('product_id');

        $this->cartService->removeItem($identifier, $productId);

         return response()->noContent();
    }
}
