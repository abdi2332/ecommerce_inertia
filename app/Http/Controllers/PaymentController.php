<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
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

    // Render payment page
    public function paymentPage(Order $order)
    {
        $order->load('items.product.images', 'shippingAddress');
        return Inertia::render('PaymentPage', ['order' => $order]);
    }

    // Initialize Chapa payment
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
                'last_name' => $user->name,
                'tx_ref' => $tx_ref,
                'callback_url' => route('payment.chapa.callback'),
                'return_url' => route('payment.chapa.return'),
                'customization' => [
                    'title' => 'Purchase',
                    'description' => 'Payment' . $order->id,
                ],
            ];

            $response = $this->chapaService->initializePayment($paymentData);

            if (isset($response['status']) && $response['status'] === 'success') {
                // Store payment record
                Payment::create([
                    'order_id' => $order->id,
                    'provider' => 'chapa',
                    'reference' => $tx_ref,
                    'amount' => $order->total,
                    'status' => 'pending',
                    'response' => json_encode($response),
                ]);

                // Update order payment_status to processing
                $order->update([
                    'payment_status' => 'processing',
                ]);

                return response()->json([
                    'checkout_url' => $response['data']['checkout_url']
                ]);
            }

            $errorMessage = $response['message'] ?? 'Failed to initialize payment';
            return response()->json(['error' => $errorMessage], 400);

        } catch (\Exception $e) {
            Log::error('Chapa Payment Error: ' . $e->getMessage());
            return response()->json(['error' => 'Payment processing error. Please try again.'], 500);
        }
    }

    // Chapa callback (webhook)
    public function chapaCallback(Request $request)
    {
        Log::info('Chapa Callback Received:', $request->all());
        $tx_ref = $request->input('tx_ref');

        if (!$tx_ref) {
            Log::error('Chapa Callback: Missing transaction reference');
            return response()->json(['status' => 'error', 'message' => 'Missing reference'], 400);
        }

        $verification = $this->chapaService->verifyPayment($tx_ref);

        if ($verification['status'] === 'success' && $verification['data']['status'] === 'success') {
            $payment = Payment::where('reference', $tx_ref)->first();

            if ($payment && $payment->status !== 'success') {
                // Update payment record
                $payment->update([
                    'status' => 'success',
                    'response' => json_encode($verification['data']),
                ]);

                // Update the related order
                $order = $payment->order;
                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'paid',
                ]);

                Log::info('Payment successful for order: ' . $order->id);
            }
        }

        return response()->json(['status' => 'success']);
    }

    // Return URL (user redirected after payment)
    public function chapaReturn(Request $request)
    {
        $tx_ref = $request->query('tx_ref');

        $payment = Payment::where('reference', $tx_ref)->first();

        if ($payment && $payment->status === 'success') {
            return redirect()->route('order.success', $payment->order_id)
                ->with('success', 'Payment completed successfully! Order #' . $payment->order_id);
        }

        return redirect()->route('orders.index')
            ->with('error', 'Payment verification failed. Please contact support.');
    }


    public function orderSuccess(Order $order){
        $order->load('items.product.images', 'shippingAddress');

        return Inertia::render('Confirmation', ['order' => $order]);
    }
}
