<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\StockTransaction;
use Illuminate\Support\Facades\DB;

class StockController extends Controller
{
    public function stockIn(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'expiration_date' => 'required|date|after:today',
        ]);

        $product = Product::findOrFail($request->product_id);

        DB::transaction(function () use ($product, $request) {
            // Create Batch
            $batch = ProductBatch::create([
                'product_id' => $product->id,
                'quantity' => $request->quantity,
                'expiration_date' => $request->expiration_date,
                'status' => 'active',
            ]);

            // Log Transaction
            StockTransaction::create([
                'product_id' => $product->id,
                'product_batch_id' => $batch->id,
                'type' => 'in',
                'quantity' => $request->quantity,
                'reason' => 'New Stock',
            ]);

            // Update Product Total Stock
            $product->increment('stock_quantity', $request->quantity);
        });

        return response()->json(['message' => 'Stock added successfully']);
    }

    public function stockOut(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string',
        ]);

        $product = Product::findOrFail($request->product_id);

        if ($product->stock_quantity < $request->quantity) {
            return response()->json(['message' => 'Insufficient stock'], 400);
        }

        DB::transaction(function () use ($product, $request) {
            $remainingToRemove = $request->quantity;

            // Log Transaction
            StockTransaction::create([
                'product_id' => $product->id,
                'type' => 'out',
                'quantity' => $request->quantity,
                'reason' => $request->reason,
            ]);

            // Deduct from batches (FIFO: earliest expiring first)
            $batches = $product->batches()->where('status', 'active')->orderBy('expiration_date', 'asc')->get();

            foreach ($batches as $batch) {
                if ($remainingToRemove <= 0) break;

                if ($batch->quantity <= $remainingToRemove) {
                    $remainingToRemove -= $batch->quantity;
                    $batch->update(['quantity' => 0, 'status' => 'depleted']);
                } else {
                    $batch->decrement('quantity', $remainingToRemove);
                    $remainingToRemove = 0;
                }
            }

            // Update Product Total Stock
            $product->decrement('stock_quantity', $request->quantity);
        });

        return response()->json(['message' => 'Stock removed successfully']);
    }
}
