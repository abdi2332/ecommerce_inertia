<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProductController;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\PaymentController;
use Illuminate\Support\Facades\Redis;

Route::get('/', [ProductController::class, 'index'])->name('welcome');


Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/test-search', function(Request $request) {
    $query = $request->input('q', ''); // default to empty string
    $results = Product::search($query)->get();
    return response()->json($results);
});

    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::post('/item/add', [CartController::class, 'updateItem']); // 
    Route::post('/item/remove', [CartController::class, 'removeItem']); //
    // Route::post('/cart/remove', [CartController::class, 'remove']);
    // Route::post('/cart/clear', [CartController::class, 'clear']);

    Route::get('/products/{product}', [ProductController::class, 'detail'])->name('products.show');
    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout');
    Route::post('/chekout/store', [CheckoutController::class, 'store'])->name('checkout.store');

    Route::get('/checkout/payment/{order}', [PaymentController::class, 'paymentPage'])->name('checkout.payment');




Route::get('/redis-test', function () {
    Redis::set('test', 'ok');
    return Redis::get('test');
});


require __DIR__.'/auth.php';
