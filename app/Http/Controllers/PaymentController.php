<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function paymentpage(Order $order)
    {
       
         $order->load('items.product', 'shippingAddress');
    
        return Inertia::render('PaymentPage', ['order' => $order]);
    }
}
