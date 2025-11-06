<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;

class OrderController extends Controller
{
    
    public function TrackOrder(Order $order)
    {
        $order->load('items.product.images', 'shippingAddress');

       
        
        return Inertia::render('TrackOrder', ['order' => $order]);
    }
    
}
