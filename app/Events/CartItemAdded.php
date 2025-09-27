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

    public  $sessionId;
    public  $productId;

    public $quantity;

    public $product;



    public function __construct($sessionId, $productId, $quantity, $product)
    {
        $this->sessionId = $sessionId;
        $this->productId = $productId;
        $this->quantity = $quantity;
        $this->product = $product;
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
