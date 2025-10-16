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

        if (Redis::hexists('cart:' . $identifier, $productId)) {
            $this->cartService->updateQuantity($identifier, $productId, $change);
        } else {
            $this->cartService->addItem($identifier, $productId, $change);
        }

        return Inertia::render('Welcome');
    }

    public function updateItem(Request $request)
    {
        $identifier = $this->getIdentifier();
        $productId = $request->input('product_id');
        $change = (int) $request->input('change');

        $this->cartService->updateQuantity($identifier, $productId, $change);

        return Inertia::render('Welcome');
    }

    public function removeItem(Request $request)
    {
        $identifier = $this->getIdentifier();
        $productId = $request->input('product_id');

        $this->cartService->removeItem($identifier, $productId);

        return Inertia::render('Welcome');
    }
}
