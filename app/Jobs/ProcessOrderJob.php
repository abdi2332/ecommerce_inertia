<?php

namespace App\Jobs;

use App\Notifications\OrderPlacedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Models\Order;

class ProcessOrderJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public $order;
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
       // In your ProcessOrderJob or directly in controller
$this->order->user->notify(
    (new OrderPlacedNotification($this->order))->onQueue('notifications')
);
    }
}
