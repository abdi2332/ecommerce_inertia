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

class CartItemUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public  $sessionId;
    public  $productId;

    public $quantity;

    public function __construct($sessionId, $productId, $quantity)
    {
        $this->sessionId = $sessionId;
        $this->productId = $productId;
        $this->quantity = $quantity;
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
                'product_id' => $this->productId,
                'quantity' => $this->quantity
            ];
        }


        public function broadcastAs(): string
        {
            return 'CartItemUpdated';
        }
}
