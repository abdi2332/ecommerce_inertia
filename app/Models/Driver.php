<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Driver extends Model
{
    protected $fillable = ['name', 'phone', 'status', 'current_lat', 'current_lng', 'last_active_at'];

    // All deliveries assigned to this driver
    public function deliveryHistories(): HasMany
    {
        return $this->hasMany(DeliveryStatusHistory::class);
    }
}
