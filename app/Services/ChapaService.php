<?php
namespace App\Services;

use Illuminate\Support\Facades\Http;

class ChapaService
{
    protected string $secret;

    public function __construct()
    {
        $this->secret = env('CHAPA_SECRET_KEY');
    }

    public function initializePayment(array $payload): array
    {
      $response = Http::withToken($this->secret)
        ->post('https://api.chapa.co/v1/transaction/initialize', $payload);

    logger('Chapa init response', $response->json());

    return $response->json();
    }

    public function verifyPayment(string $tx_ref): array
    {
        return Http::withToken($this->secret)
            ->get("https://api.chapa.co/v1/transaction/verify/{$tx_ref}")
            ->json();
    }
}
