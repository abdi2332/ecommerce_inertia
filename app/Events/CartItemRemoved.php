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

     public $identifier;

     public $productId;

        public bool $isAuthenticated;

    public function __construct($identifier, $productId, $isAuthenticated = false)
    {
        $this->productId = $productId;
        $this->identifier = $identifier;
        $this->isAuthenticated = $isAuthenticated;
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
            'product_id' => $this->productId
        ];
    }

    public function broadcastAs(): string
    {
        return 'CartItemRemoved';
    }



}
