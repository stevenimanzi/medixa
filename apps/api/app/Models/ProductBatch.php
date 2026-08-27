<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductBatch extends Model
{
    protected $fillable = ['product_id', 'quantity', 'expiration_date', 'status'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
