<?php  
namespace App\Services;
use Illuminate\Support\Facades\Redis;
use App\Models\Product;

class CheckoutService {
	public function calculateTotal( $shippingFee = 250, $paymentFee = 0, $promoCode = null)
{
	 $identifier = auth()->check() ? auth()->id() : session()->getId();
    $cart = Redis::hgetall("cart:{$identifier}");
    if (empty($cart)) {
        return [
            'subtotal' => 0,
            'discount' => 0,
            'tax' => 0,
            'shipping_fee' => $shippingFee,
            'payment_fee' => $paymentFee,
            'total' => 0
        ];
    }

    $products = Product::whereIn('id', array_keys($cart))->get();

    $subtotal = 0;
    foreach ($products as $product) {
        $qty = (int) $cart[$product->id];
        $subtotal += $product->price * $qty;
    }

    // Apply discount if any
    $discount = 0;
    // if ($promoCode) {
    //     $discount = PromoService::calculateDiscount($promoCode, $subtotal);
    // }

    // Tax example 15%
    $taxRate = 0.15;
    $tax = ($subtotal - $discount) * $taxRate;

    $total = $subtotal - $discount + $tax + $shippingFee + $paymentFee;

    return [
        'subtotal' => $subtotal,
        'discount' => $discount,
        'tax' => $tax,
        'shipping_fee' => $shippingFee,
        'payment_fee' => $paymentFee,
        'total' => $total
    ];
}

}