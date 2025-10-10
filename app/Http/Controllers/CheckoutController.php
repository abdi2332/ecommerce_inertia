<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\CheckoutService;
use Inertia\Inertia;
use App\Models\Address;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;


class CheckoutController extends Controller
{
    protected $checkoutService;
    public function __construct(CheckoutService $checkoutService)
    {
        $this->checkoutService = $checkoutService;
    }

    public function index()
    {
        $totalCost = $this->checkoutService->calculateTotal();
    
        return Inertia::render('Checkout', [
            'totalCost' => $totalCost
        ]);
    }

    public function store(Request $request)
    {
            logger($request->all());
   
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'region' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            // 'address_line' => 'required|string|max:255',
            'is_default' => 'boolean',
            'payment_method' => 'required|in:chapa,telebirr,cod',
            // 'cart' => 'required|array|min:1',
            // 'cart.*.product_id' => 'required|integer|exists:products,id',
            // 'cart.*.quantity' => 'required|integer|min:1',
            // 'cart.*.price' => 'required|numeric|min:0',
        ]);

      

         

        DB::beginTransaction();

        try {
            // 1️⃣ Create or reuse address
            $address = Address::create([
                'user_id' => auth()->id()?:null,
                'full_name' => $validated['full_name'],
                'phone' => $validated['phone'],
                'region' => $validated['region'],
                'city' => $validated['city'],
                'address_line' => $validated['address_line'],
                'is_default' => $validated['is_default'] ?? false,
            ]);

            // 2️⃣ Calculate order totals
            $subtotal = collect($validated['cart'])->sum(fn($item) => $item['price'] * $item['quantity']);
            $discount = 0; // You can plug in your discount logic here
            $tax = 0;
            $shipping_fee = 0;
            $payment_fee = 0;
            $total = $subtotal - $discount + $tax + $shipping_fee + $payment_fee;

            // 3️⃣ Create order
            $order = Order::create([
                'user_id' => auth()->id(),
                'status' => 'pending',
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'unpaid',
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => $tax,
                'shipping_fee' => $shipping_fee,
                'payment_fee' => $payment_fee,
                'total' => $total,
                'shipping_address_id' => $address->id,
            ]);

            // 4️⃣ Create order items
            foreach ($validated['cart'] as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $item['price'] * $item['quantity'],
                ]);
            }

            DB::commit();

            // 5️⃣ Success response for Inertia
            return redirect()->route('order.success')->with('success', 'Order placed successfully!');
        } catch (\Throwable $e) {
            DB::rollBack();
            report($e);

            return back()->withErrors(['error' => 'Failed to process order. Please try again.']);
        }
    }

    public function success()
    {
        return Inertia::render('OrderSuccess', [
            'message' => session('success') ?? 'Your order has been placed successfully!',
        ]);
    }
     
    
}
