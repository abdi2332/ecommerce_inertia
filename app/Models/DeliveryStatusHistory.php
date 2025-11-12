<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class DeliveryStatusHistory extends Model
{
    protected $fillable = ['order_id', 'driver_id', 'status', 'changed_at'];

    // The order this status belongs to
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    // The driver who picked / is handling this order
    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }
}
