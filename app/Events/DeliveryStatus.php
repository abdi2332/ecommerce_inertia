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

    /**
     * Create a new event instance.
     */

     public $status;

     public $userId;

     public $orderId;



    public function __construct($status, $userId, $orderId)
    
    {
        $this->status = $status;
        $this->userId = $userId;
        $this->orderId = $orderId;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
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
