<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class PosController extends Controller
{
    public function getProducts()
    {
        return response()->json(Product::where('stock_quantity', '>', 0)->get());
    }

    public function getCustomers()
    {
        return response()->json(Customer::all());
    }

    public function checkout(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric',
            'payment_method' => 'required|string',
            'customer_id' => 'nullable|exists:customers,id'
        ]);

        try {
            DB::beginTransaction();

            $totalAmount = 0;
            foreach ($request->items as $item) {
                $totalAmount += ($item['quantity'] * $item['unit_price']);
            }

            $sale = Sale::create([
                'user_id' => $request->user()->id,
                'customer_id' => $request->customer_id,
                'receipt_no' => '#RCT-' . Str::upper(Str::random(6)),
                'total_amount' => $totalAmount,
                'payment_method' => $request->payment_method
            ]);

            foreach ($request->items as $item) {
                $subtotal = $item['quantity'] * $item['unit_price'];
                
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $subtotal
                ]);

                // Deduct stock
                $product = Product::find($item['product_id']);
                $product->decrement('stock_quantity', $item['quantity']);
            }

            DB::commit();

            return response()->json(['message' => 'Sale completed successfully', 'sale' => $sale]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Checkout failed: ' . $e->getMessage()], 500);
        }
    }
}
