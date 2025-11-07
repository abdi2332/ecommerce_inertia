<?php

namespace App\Http\Controllers;

use App\Events\DeliveryStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\DeliveryStatusHistory;

class OrderController extends Controller
{
    
    public function TrackOrder(Order $order)
    {
        $order->load('items.product.images', 'shippingAddress');

       
        
        return Inertia::render('TrackOrder', ['order' => $order, 'userId' => auth()->id()]);
    }


    public function updateStatus(Request $request, Order $order)
    {

        logger('Update Status Request:', $request->all());
       $validated= $request->validate([
            'status' => 'required|in:pending,assigned,picked_up,on_the_way,delivered,failed',
        ]);

        DeliveryStatusHistory::where('order_id', $order->id)
            ->update([
                'status' => $validated['status'],
                'changed_at' => now(),
        ]);
        

       broadcast( new DeliveryStatus($validated['status'], $order->user_id, $order->id));

        

        return back()->with('success', 'Order status updated successfully.');
    }
    
}
