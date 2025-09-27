<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Scout\Searchable;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;
    use Searchable;
    protected $fillable = [
        'category_id', 'name', 'slug', 'description', 'price', 'stock', 'status'
    ];

    public function toSearchableArray()
    {
        return [
            'id'          => (string) $this->id,
            'name'        => $this->name,
            'description' => $this->description ? (string) $this->description : '',
            'price'       => (float) $this->price,
            'stock'       => (int) $this->stock,
            'image'       => $this->images()->where('is_primary', true)->value('image_path') ?? '',
            'category' => $this->category ? trim(Str::lower($this->category->name)) : '',
            'created_at'  => $this->created_at->timestamp,
        ];
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }


    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function attributes()
    {
        return $this->hasMany(ProductAttribute::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}

