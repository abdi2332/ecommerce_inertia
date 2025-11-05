<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;

class OrderController extends Controller
{
    
    public function TrackOrder(Order $order)
    {
        $address = $order->shippingAddress;

        logger($address);
        
        return Inertia::render('TrackOrder', [ 'Address' => $address]);
    }
    
}
