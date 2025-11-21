<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DriverLocationUpdate implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $orderId;
    public array $location;

    public int $userId;

    public function __construct(int $orderId, array $location, int $userId)
    {
        $this->orderId = $orderId;
        $this->location = $location;
        $this->userId= $userId;

    }

    public function broadcastOn()
    {
        return new PrivateChannel("order.{$this->userId}");
    }

   
    public function broadcastWith()
{
    return [
        'orderId' => $this->orderId,
        'lat' => $this->location['lat'] ?? null,
        'lng' => $this->location['lng'] ?? null,
        'recorded_at' => $this->location['recorded_at'] ?? null,

        'eta' => $this->location['eta'] ?? null,
        'eta_seconds' => $this->location['eta_seconds'] ?? null,

        'distance' => $this->location['distance'] ?? null,
        'distance_meters' => $this->location['distance_meters'] ?? null,
    ];
}



    public function broadcastAs()
    {
        return 'DriverLocationUpdate';
    }


}
