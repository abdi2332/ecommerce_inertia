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
use Illuminate\Support\Facades\Http;

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

     
        logger($request->all());
     
   
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'region' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'address_line' => 'required|string|max:255',
            'is_default' => 'boolean',
            'payment_method' => 'required|in:chapa,telebirr,cod',
        ]);

       logger('Validated Data: ' . json_encode($validated));


      

         

        DB::beginTransaction();

        try {
            
            $coordinates = $this->getCoordinatesFromAddress($validated['address_line']);

            logger('Geocoded Coordinates: ' . json_encode($coordinates));

            $address = Address::create([
                'user_id' => auth()->id(),
                'full_name' => $validated['full_name'],
                'phone' => $validated['phone'],
                'region' => $validated['region'],
                'city' => $validated['city'],
                'address_line' => $validated['address_line'],
                'is_default' => $validated['is_default'] ?? false,
                'lat' => $coordinates['lat'] ?? null,
                'lng' => $coordinates['lng'] ?? null,
            ]);

            logger( 'address created: '. json_encode($address));
            
        

         
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

        $this->cartService->clearCart($this->cartService->getCartIdentifier());
        
            return redirect()->route('order.success', $order->id)->with('success', 'Order placed successfully!');
        } catch (\Throwable $e) {
            DB::rollBack();
            report($e);

            return back()->withErrors(['error' => 'Failed to process order. Please try again.']);
        }
    }

   protected function getCoordinatesFromAddress(string $address): ?array
   {
       $response = Http::get('https://maps.googleapis.com/maps/api/geocode/json', [
           'address' => $address,
           'key' => config('services.google.maps_key'),
       ]);
   
       $data = $response->json();

       logger('Geocoding response: ' . json_encode($data));
   
       if (!empty($data['results'][0]['geometry']['location'])) {
           return [
               'lat' => $data['results'][0]['geometry']['location']['lat'],
               'lng' => $data['results'][0]['geometry']['location']['lng'],
           ];
       }
   
       return null;
   }
     
    
}
