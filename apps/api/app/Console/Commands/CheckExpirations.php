<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ProductBatch;
use App\Models\StockTransaction;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CheckExpirations extends Command
{
    protected $signature = 'stock:check-expirations';
    protected $description = 'Check for expired stock batches and remove them from active stock';

    public function handle()
    {
        $today = Carbon::today();
        
        $expiredBatches = ProductBatch::where('status', 'active')
            ->whereDate('expiration_date', '<', $today)
            ->get();

        foreach ($expiredBatches as $batch) {
            DB::transaction(function () use ($batch) {
                // Log transaction
                StockTransaction::create([
                    'product_id' => $batch->product_id,
                    'product_batch_id' => $batch->id,
                    'type' => 'expired',
                    'quantity' => $batch->quantity,
                    'reason' => 'Auto-removed due to expiration',
                ]);

                // Deduct from product total stock
                $batch->product->decrement('stock_quantity', $batch->quantity);

                // Update batch status
                $batch->update([
                    'quantity' => 0,
                    'status' => 'expired'
                ]);
            });
            
            $this->info("Expired batch {$batch->id} of Product {$batch->product_id} processed.");
        }

        $this->info('Expiration check complete.');
    }
}
