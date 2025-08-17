<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Product;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProductImage>
 */
class ProductImageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [

        'product_id' => Product::inRandomOrder()->first()->id ?? Product::factory(),
        'image_path' => fake()->imageUrl(640, 480, 'products', true),
        'is_primary' => fake()->boolean(20), // 20% chance of being primary
        ];
    }
}
