<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Scopes\CompanyScope;
class Product extends Model {
    use HasFactory;
    protected $guarded = [];
    protected static function booted() {
        static::addGlobalScope(new CompanyScope);
    }

    public function batches()
    {
        return $this->hasMany(ProductBatch::class);
    }

    public function transactions()
    {
        return $this->hasMany(StockTransaction::class);
    }
}
