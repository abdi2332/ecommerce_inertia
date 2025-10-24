<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Order;

class Payment extends Model
{
    
        // Mass assignable fields
        protected $fillable = [
            'order_id',
            'provider',
            'reference',
            'amount',
            'status',
            'response',
        ];
    
        // Cast 'response' JSON to array automatically
        protected $casts = [
            'response' => 'array',
        ];
    
        /**
         * Get the order associated with this payment.
         */
        public function order()
        {
            return $this->belongsTo(Order::class);
        }
}
