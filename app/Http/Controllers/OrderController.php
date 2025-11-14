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
   

       
        
        return Inertia::render('TrackOrder', ['order' => $order, 'userId' => auth()->id(), 'status' => $statusHistoy ? $statusHistoy: null]);
    }


    public function TrackDriver(Order $order)
    {
        $order->load('items.product.images', 'shippingAddress');
        
        $statusHistoy= DeliveryStatusHistory::where('order_id', $order->id)->first();

       
        
        return Inertia::render('CustomerTrack', ['order' => $order, 'userId' => auth()->id(), 'status' => $statusHistoy ? $statusHistoy: null]);
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

        logger('Broadcasting Delivery Status:', ['status' => $validated['status'], 'user_id' => $order->user_id, 'order_id' => $order->id]);
        

        broadcast(new DeliveryStatus( $validated['status'], (int) $order->user_id,  (int) $order->id ));

        

        return response()->noContent();

    }
    
}
