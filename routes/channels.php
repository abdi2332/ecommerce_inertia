<?php

use Illuminate\Support\Facades\Broadcast;

// Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
//     return (int) $user->id === (int) $id;
// });

// In routes/channels.php
Broadcast::channel('cart.{sessionId}', function () {
    return true; // Always allow access to public cart channels
});

Broadcast::channel('cart.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});


Broadcast::channel('order.{userId}', function ($user, $userId) {
    // Customer can access their own channel
    if ((int) $user->id === (int) $userId) {
        return true;
    }
    
    // Staff/Driver can also access (to broadcast)
    if ($user->hasRole('driver') || $user->hasRole('Admin')) {
        return true;
    }
    
    return false;
});