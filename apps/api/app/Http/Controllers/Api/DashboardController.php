<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Customer;
use App\Models\Expense;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function summary(Request $request)
    {
        $sevenDaysAgo = Carbon::now()->subDays(7);
        
        $totalProducts = Product::count();
        $totalRevenue = Sale::sum('total_amount');
        $totalOrders = Sale::count();
        $totalCustomers = Customer::count();

        // Income vs Expenses for last 7 months
        $incomeExpenses = collect();
        $profitInvestment = collect();
        
        for ($i = 6; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $monthName = $month->format('M');
            
            $income = Sale::whereYear('created_at', $month->year)
                          ->whereMonth('created_at', $month->month)
                          ->sum('total_amount');
                          
            $expenses = Expense::whereYear('expense_date', $month->year)
                             ->whereMonth('expense_date', $month->month)
                             ->sum('amount');
                             
            $incomeExpenses->push([
                'name' => $monthName,
                'income' => $income,
                'expenses' => $expenses
            ]);
            
            $profitInvestment->push([
                'name' => $monthName,
                'profit' => max(0, $income - $expenses),
                'investment' => 5000000 // mock investment line
            ]);
        }

        $recentSales = Sale::with(['user', 'customer'])->latest()->take(5)->get()->map(function($sale) {
            return [
                'receipt' => $sale->receipt_no,
                'cashier' => $sale->user ? $sale->user->name : 'Unknown',
                'amount' => 'RWF ' . number_format($sale->total_amount),
                'payment' => $sale->payment_method,
                'date' => $sale->created_at->format('Y-m-d')
            ];
        });

        return response()->json([
            'stats' => [
                ['label' => 'Total Products', 'value' => number_format($totalProducts), 'trend' => '+0%'],
                ['label' => 'Total Revenue', 'value' => 'RWF ' . number_format($totalRevenue), 'trend' => '+0%'],
                ['label' => 'Total Orders', 'value' => number_format($totalOrders), 'trend' => '+0%'],
                ['label' => 'Customers', 'value' => number_format($totalCustomers), 'trend' => '+0%'],
            ],
            'incomeVsExpenses' => $incomeExpenses,
            'profitVsInvestment' => $profitInvestment,
            'recentSales' => $recentSales
        ]);
    }
}
