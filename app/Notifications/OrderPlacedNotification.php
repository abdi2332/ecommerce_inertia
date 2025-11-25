<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Order;

class OrderPlacedNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public $order;
      public $orderItems;

    /**
     * Create a new notification instance.
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
        // Eager load order items with product information
        $this->orderItems = $order->items()->with('product.category', 'product.images')->get();
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
   public function toMail(object $notifiable): MailMessage
{
    $mailMessage = (new MailMessage)
                ->subject('Order Confirmation - #' . $this->order->id)
                ->greeting('Hello ' . $this->order->user->name . '!')
                ->line('Thank you for your order! Here are your order details:')
                ->line('')
                ->line('**Order Items:**');

    // Add order items in a compact format
    foreach ($this->orderItems as $item) {
        $itemTotal = $item->subtotal ?: ($item->price * $item->quantity);
        $mailMessage->line(
            '• ' . $item->product->name . 
            ' × ' . $item->quantity . 
            ' — $' . number_format($itemTotal, 2)
        );
    }

    $mailMessage->line('')
                ->line('**Order Total: $' . number_format($this->order->total, 2) . '**')
                ->line('Payment Method: ' . ucfirst($this->order->payment_method))
                ->line('Order Status: ' . ucfirst($this->order->status))
                ->line('')
                ->action('Track Your Order', url('/orders/' . $this->order->id))
                ->line('We will notify you when your order ships!');

    return $mailMessage;
}

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
      public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'amount' => $this->order->total,
        ];
    }
}
