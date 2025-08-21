<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         $categories = Category::all();


        $products = [
            [
                'name' => 'Apple iPhone 15',
                'description' => 'Latest model of iPhone with amazing features.',
                'price' => 1199.99,
                'stock' => 50,
                'status' => 'active',
            ],
            [
                'name' => 'Nike Air Max 270',
                'description' => 'Comfortable sneakers for everyday wear.',
                'price' => 150.00,
                'stock' => 100,
                'status' => 'active',
            ],
            [
                'name' => 'Samsung 65" 4K TV',
                'description' => 'Ultra HD smart TV with vibrant display.',
                'price' => 799.99,
                'stock' => 30,
                'status' => 'active',
            ],
            [
                'name' => 'Levi’s 501 Jeans',
                'description' => 'Classic fit denim jeans for men and women.',
                'price' => 69.99,
                'stock' => 80,
                'status' => 'active',
            ],
            [
                'name' => 'Instant Pot Duo 7-in-1',
                'description' => 'Multi-use programmable pressure cooker.',
                'price' => 99.99,
                'stock' => 40,
                'status' => 'active',
            ],
        ];

        foreach ($products as $product) {
            // Pick a random category for each product
            $category = $categories->random();

            Product::updateOrCreate(
                ['slug' => Str::slug($product['name'])],
                array_merge($product, [
                    'category_id' => $category->id,
                    'slug' => Str::slug($product['name']),
                ])
            );
        }
    }
}
