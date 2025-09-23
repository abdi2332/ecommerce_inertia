<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CartUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $sessionId;
    public $cart;

    public function __construct($sessionId, $cart)
    {
        $this->sessionId = $sessionId;
        $this->cart = $cart;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel("cart.{$this->sessionId}"), // Changed to public Channel
        ];
    }

    public function broadcastAs(): string
    {
        return 'CartUpdated';
    }
}