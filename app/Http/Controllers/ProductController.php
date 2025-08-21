<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Inertia\Inertia;
use Illuminate\Foundation\Application;


class ProductController extends Controller
{

    public function index()
    {
         $products = Product::with('category', 'images')->get();

    return Inertia::render('Welcome', [
        'products' => $products,
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'auth' => [
            'user' => auth()->user() ? [
                'id' => auth()->id(),
                'name' => auth()->user()->name,
                'email' => auth()->user()->email,
            ] : null,
        ],
    ]);
}

}