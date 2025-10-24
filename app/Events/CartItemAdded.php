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

class CartItemAdded implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public  $identifier;
    public  $productId;

    public $quantity;

    public $product;

    public bool $isAuthenticated;



    public function __construct($identifier, $productId, $quantity, $product, $isAuthenticated = false)
    {
        $this->identifier = $identifier;
        $this->productId = $productId;
        $this->quantity = $quantity;
        $this->product = $product;
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
            'product' => [
                'id' => $this->product['id'],
                'name' => $this->product['name'],
                'price' => $this->product['price'],
            ],
            'quantity' => $this->quantity
        ];
    }

    public function broadcastAs(): string
    {
        return 'CartItemAdded';
    }

}
