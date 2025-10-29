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

class StockUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public $productId;
    public $newStock;
    public function __construct($newStock, $productId)
    
    {
        $this->productId = $productId;
        $this->newStock = $newStock;
    }



    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
    
        return [
            new Channel('Stock'),
        ];
    }

    public function broadcastWith(){
        return [
            'productId' => $this->productId,
            'newstock' => $this->newStock
        ];
    }
    public function broadcastAs(): string
    {
        return 'StockUpdated';
    }
}
