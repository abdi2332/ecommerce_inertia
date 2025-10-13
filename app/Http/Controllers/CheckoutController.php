<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\CheckoutService;
use Inertia\Inertia;
use App\Models\Address;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\CartService;
use Illuminate\Support\Facades\DB;
use App\Models\Cart;
use App\Models\CartItem;

class CheckoutController extends Controller
{
    protected $checkoutService;
    protected $cartService;
    public function __construct(CheckoutService $checkoutService, CartService $cartService)
    {
        $this->checkoutService = $checkoutService;
        $this->cartService = $cartService;
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

        $cart=$this->cartService->getCartData($this->cartService->getCartIdentifier());
        $totalCost = $this->checkoutService->calculateTotal();

        logger($totalCost);
     
   
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'region' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'address_line' => 'required|string|max:255',
            'is_default' => 'boolean',
            'payment_method' => 'required|in:chapa,telebirr,cod',
            'total'=>'required|numeric|min:0',
        ]);

       logger('Validated Data: ' . json_encode($validated));


      

         

        DB::beginTransaction();

        try {
            
            $address = Address::create([
                'full_name' => $validated['full_name'],
                'phone' => $validated['phone'],
                'region' => $validated['region'],
                'city' => $validated['city'],
                'address_line' => $validated['address_line'],
                'is_default' => $validated['is_default'] ?? false,
            ]);

        

         
            $order = Order::create([
                'user_id' => auth()->id(),
                'status' => 'pending',
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'unpaid',
                'subtotal' => $totalCost['subtotal'],
                'discount' => $totalCost['discount'],
                'tax' => $totalCost['tax'],
                'shipping_fee' => $totalCost['shipping_fee'],
                'payment_fee' => $totalCost['payment_fee'],
                'total' => $totalCost['total'],
                'shipping_address_id' => $address->id,
            ]);

           
            foreach ($cart as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['id'],
                    'quantity' => $item['qty'],
                    'price' => $item['price'],
                    'subtotal' => $item['subtotal'],
                ]);
            }

            DB::commit();

             if (in_array($validated['payment_method'], ['chapa', 'telebirr'])) {
            return redirect()->route('checkout.payment', $order->id);
        }

          
            return redirect()->route('order.success')->with('success', 'Order placed successfully!');
        } catch (\Throwable $e) {
            DB::rollBack();
            report($e);

            return back()->withErrors(['error' => 'Failed to process order. Please try again.']);
        }
    }

    // public function success()
    // {
    //     return Inertia::render('OrderSuccess', [
    //         'message' => session('success') ?? 'Your order has been placed successfully!',
    //     ]);
    // }
     
    
}
