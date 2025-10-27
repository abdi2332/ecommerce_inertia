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

    public  $identifier;
    public  $productId;

    public $quantity;
    public bool $isAuthenticated;

    public $cartCount;

    public function __construct($identifier, $productId, $quantity, $isAuthenticated, $cartCount = null)
    {
        $this->identifier = $identifier;
        $this->productId = $productId;
        $this->quantity = $quantity;
        $this->isAuthenticated = $isAuthenticated;
        $this->cartCount = $cartCount;
    }



    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    
     public function broadcastOn(): array
     {
         if ($this->isAuthenticated) {
             // Secure private channel for logged-in user
             return [new PrivateChannel("cart.{$this->identifier}")];
         }
 
         // Public for guest carts
         return [new Channel("cart.{$this->identifier}")];
     }

    


        public function broadcastWith(){
    
            return [
                'product_id' => $this->productId,
                'quantity' => $this->quantity,
                'cart_count' => $this->cartCount,
            ];
        }


        public function broadcastAs(): string
        {
            return 'CartItemUpdated';
        }
}
