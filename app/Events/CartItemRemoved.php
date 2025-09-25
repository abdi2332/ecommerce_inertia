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

class CartItemRemoved implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */

     public $sessionId;

     public $productId;
    public function __construct($sessionId, $productId)
    {
        $this->productId = $productId;
        $this->sessionId = $sessionId;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel("cart.{$this->sessionId}"), // Changed to public Channel
        ];
    }

    public function broadcastWith(){
        return [
            'product_id' => $this->productId
        ];
    }

    public function broadcastAs(): string
    {
        return 'CartItemRemoved';
    }



}
