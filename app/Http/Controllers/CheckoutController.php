<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\CheckoutService;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    protected $checkoutService;
    public function __construct(CheckoutService $checkoutService)
    {
        $this->checkoutService = $checkoutService;
    }

    public function index()
    {
        $totalCost = $this->checkoutService->calculateTotal();
    
        return Inertia::render('Checkout', [
            'totalCost' => $totalCost
        ]);
    }
     
    
}
