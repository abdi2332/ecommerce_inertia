<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
  protected $fillable = [
    'user_id',
    'status',
    'payment_method',
    'payment_status',
    'subtotal',
    'discount',
    'tax',
    'shipping_fee',
    'payment_fee',
    'total',
    'shipping_address_id',
];


    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function shippingAddress()
    {
        return $this->belongsTo(Address::class, 'shipping_address_id');
    }

    public function deliveryStatusHistories()
    {
        return $this->hasMany(DeliveryStatusHistory::class);
    }
}

