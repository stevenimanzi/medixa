<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Sale;
use App\Models\Expense;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function dashboard()
    {
        // Totals
        $totalIncome = Sale::sum('total_amount');
        $totalExpenses = Expense::sum('amount');
        $netProfit = $totalIncome - $totalExpenses;

        // Chart Data (Last 7 Days)
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dateString = $date->format('Y-m-d');
            $displayDate = $date->format('M d');

            $income = Sale::whereDate('created_at', $dateString)->sum('total_amount');
            $expense = Expense::whereDate('expense_date', $dateString)->sum('amount');

            $chartData[] = [
                'name' => $displayDate,
                'Income' => (float) $income,
                'Expenses' => (float) $expense,
            ];
        }

        // Recent Sales
        $recentSales = Sale::with('user')->orderBy('created_at', 'desc')->take(5)->get();

        return response()->json([
            'totals' => [
                'income' => $totalIncome,
                'expenses' => $totalExpenses,
                'profit' => $netProfit
            ],
            'chartData' => $chartData,
            'recentSales' => $recentSales
        ]);
    }
}
