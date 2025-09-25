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




   
}