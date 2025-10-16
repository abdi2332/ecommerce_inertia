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

    public function __construct($identifier, $cart, $isAuthenticated = false)
    {
        $this->identifier = $identifier;
        $this->cart = $cart;
        $this->isAuthenticated = $isAuthenticated;
    }

    public function broadcastOn(): array
    {
        if ($this->isAuthenticated) {
            // Secure private channel for logged-in user
            return [new PrivateChannel("cart.{$this->identifier}")];
        }

        
        return [new Channel("cart.{$this->identifier}")];
    }

    public function broadcastAs(): string
    {
        return 'CartUpdated';
    }
}