<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;

class CartUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $identifier;
    public $cart;

    public bool $isAuthenticated;

    public $cartCount;

    public function __construct($identifier, $cart, $isAuthenticated = false, $cartCount = null)
    {
        $this->identifier = $identifier;
        $this->cart = $cart;
        $this->isAuthenticated = $isAuthenticated;
        $this->cartCount = $cartCount;
    }

    public function broadcastOn(): array
    {
        if ($this->isAuthenticated) {
            // Secure private channel for logged-in user
            return [new PrivateChannel("cart.{$this->identifier}")];
        }

        
        return [new Channel("cart.{$this->identifier}")];
    }

    public function broadcastWith(){
        return [
            'cart' => $this->cart,
            'cart_count' => $this->cartCount,
        ];
    }

    public function broadcastAs(): string
    {
        return 'CartUpdated';
    }
}