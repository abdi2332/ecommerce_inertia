<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\ChapaService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected $chapaService;

    public function __construct(ChapaService $chapaService)
    {
        $this->chapaService = $chapaService;
    }

    public function paymentpage(Order $order)
    {
        $order->load('items.product.images', 'shippingAddress');
    
        return Inertia::render('PaymentPage', ['order' => $order]);
    }

    /**
     * Initialize Chapa payment
     */
    public function initializeChapaPayment(Order $order, Request $request)
    {
        try {
            $user = auth()->user();
            $tx_ref = 'order-' . $order->id . '-' . uniqid();

            $paymentData = [
                'amount' => $order->total,
                'currency' => 'ETB',
                'email' => $user->email,
                'first_name' => $order->shippingAddress->full_name ?? $user->name,
                'last_name' => '',
                'tx_ref' => $tx_ref,
                'callback_url' => route('payment.chapa.callback'),
                'return_url' => route('payment.chapa.return'),
                'customization' => [
                    'title' => 'Ecommerce Purchase',
                    'description' => 'Payment for Order #' . $order->id,
                ],
            ];

            // Initialize payment with Chapa
            $response = $this->chapaService->initializePayment($paymentData);

            if (isset($response['status']) && $response['status'] === 'success') {
                // Update order with transaction reference
                $order->update([
                    'transaction_reference' => $tx_ref,
                    'payment_status' => 'processing'
                ]);

                // Redirect to Chapa checkout page
                return redirect($response['data']['checkout_url']);
            }

            $errorMessage = $response['message'] ?? 'Failed to initialize payment';
            return redirect()->route('checkout.payment', $order->id)
                ->with('error', 'Payment initialization failed: ' . $errorMessage);

        } catch (\Exception $e) {
            Log::error('Chapa Payment Error: ' . $e->getMessage());
            return redirect()->route('checkout.payment', $order->id)
                ->with('error', 'Payment processing error. Please try again.');
        }
    }

    /**
     * Chapa payment callback (webhook)
     */
    public function chapaCallback(Request $request)
    {
        Log::info('Chapa Callback Received:', $request->all());

        $tx_ref = $request->input('tx_ref');
        
        if (!$tx_ref) {
            Log::error('Chapa Callback: Missing transaction reference');
            return response()->json(['status' => 'error', 'message' => 'Missing reference'], 400);
        }

        // Verify payment with Chapa
        $verification = $this->chapaService->verifyPayment($tx_ref);

        if ($verification['status'] === 'success' && $verification['data']['status'] === 'success') {
            // Find order by transaction reference
            $order = Order::where('transaction_reference', $tx_ref)->first();

            if ($order) {
                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'confirmed'
                ]);

                // Clear cart after successful payment
                // Add your cart clearing logic here

                Log::info('Payment successful for order: ' . $order->id);
            }
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * Chapa return URL (user redirected here after payment)
     */
    public function chapaReturn(Request $request)
    {
        $tx_ref = $request->query('tx_ref');
        
        if ($tx_ref) {
            $order = Order::where('transaction_reference', $tx_ref)->first();
            
            if ($order && $order->payment_status === 'paid') {
                return redirect()->route('order.success')
                    ->with('success', 'Payment completed successfully! Order #' . $order->id);
            }
        }

        return redirect()->route('orders.index')
            ->with('error', 'Payment verification failed. Please contact support.');
    }
}