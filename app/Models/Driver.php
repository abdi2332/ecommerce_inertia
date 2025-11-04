<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;

class Driver extends Model
{
    protected $fillable = ['name', 'user_id','phone', 'status', 'current_lat', 'current_lng', 'last_active_at'];

    // All deliveries assigned to this driver
    public function deliveryHistories(): HasMany
    {
        return $this->hasMany(DeliveryStatusHistory::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
