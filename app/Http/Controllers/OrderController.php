<?php

namespace App\Http\Controllers;

use App\Events\DeliveryStatus;
use App\Events\DriverLocationUpdate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\DeliveryStatusHistory;
use App\Models\OrderTracking;
use Illuminate\Support\Facades\Redis;


class OrderController extends Controller
{
    
    public function TrackOrder(Order $order)
    {
        $order->load('items.product.images', 'shippingAddress');
   
       
        
        return Inertia::render('TrackOrder', ['order' => $order, 'userId' => auth()->id(),]);
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

        // logger('Broadcasting Delivery Status:', ['status' => $validated['status'], 'user_id' => $order->user_id, 'order_id' => $order->id]);
        

        // broadcast(new DeliveryStatus( $validated['status'], (int) $order->user_id,  (int) $order->id ));

        

        return response()->noContent();

    }

   public function locateDriver(Request $request, Order $order)
{
    $locationData = [
        'lat' => $request->input('lat'),
        'lng' => $request->input('lng'),
        'recorded_at' => now(),
        'eta' => $request->input('eta'),
        'eta_seconds' => $request->input('eta_seconds'),
        'distance' => $request->input('distance'),
        'distance_meters' => $request->input('distance_meters'),
    ];

    // Save to Redis
    Redis::setex("order:{$order->id}:driver_location", 60, json_encode($locationData));


    logger('Broadcasting Driver Location Update:', ['order_id' => $order->id, 'user_id' => $order->user_id, 'location' => $locationData]);

    // Broadcast to customer
    broadcast(new DriverLocationUpdate(
        $order->id,
        $locationData,
        $order->user_id
    ));

    return response()->noContent();
}

    

    public function updateETA(Order $order, Request $request){

        $etaData = [
            'eta' => $request->eta,
            'eta_seconds' => $request->eta_seconds,
            'distance' => $request->distance,
            'distance_meters' => $request->distance_meters,
            'timestamp' => $request->timestamp,
            'order_id' => $order->id,
        ];
    
        // Store in Redis with 1 hour expiration
        Redis::setex("order:{$order->id}:eta", 3600, json_encode($etaData));
    
        // Broadcast to customer via WebSocket
        // broadcast(new ETAUpdated($order, $etaData));
    }
    
}
