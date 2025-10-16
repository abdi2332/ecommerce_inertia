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