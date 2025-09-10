<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductAttribute;

class ItemSeeder extends Seeder
{
    /**
     * Generate a unique slug for a given model.
     */
    private function generateUniqueSlug(string $title, string $modelClass): string
    {
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $count = 1;

        while ($modelClass::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count;
            $count++;
        }

        return $slug;
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $response = Http::get('https://dummyjson.com/products?limit=100');
        $products = $response->json()['products'];

        foreach ($products as $product) {
            // Category
            $category = Category::firstOrCreate(
                ['name' => $product['category']],
                ['slug' => Str::slug($product['category'])]
            );

            // Product with unique slug
            $newProduct = Product::create([
                'category_id' => $category->id,
                'name'        => $product['title'],
                'slug'        => $this->generateUniqueSlug($product['title'], Product::class),
                'description' => $product['description'],
                'price'       => $product['price'],
                'stock'       => $product['stock'],
                'status'      => 'active',
            ]);

            // Product images
            foreach ($product['images'] as $index => $image) {
                ProductImage::create([
                    'product_id' => $newProduct->id,
                    'image_path' => $image,
                    'is_primary' => $index === 0,
                ]);
            }

            // Product attributes (if provided by your API/data)
            foreach ($product['attributes'] ?? [] as $attribute) {
                ProductAttribute::create([
                    'product_id' => $newProduct->id,
                    'name'       => $attribute['name'],
                    'value'      => $attribute['value'],
                ]);
            }
        }
    }
}
