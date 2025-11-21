<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DeliveryStatus implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $status;
    public $userId;
    public $orderId;

    public function __construct($status, $userId, $orderId)
    {
        // ADD THESE TYPE CASTS - This is the fix!
        $this->status = $status;
        $this->userId = (int) $userId;    // ← CAST TO INTEGER
        $this->orderId = (int) $orderId;  // ← CAST TO INTEGER
     
    }

    public function broadcastOn(): array
    {
      
        return [
            new PrivateChannel("orders.{$this->userId}"),
        ];
    }

    public function broadcastWith(){
        return [
            'status' => $this->status,
            'order_id' => $this->orderId,
            'user_id' => $this->userId,
        ];
    }

    public function broadcastAs(): string
    {
        return 'DeliveryStatus';
    }
}