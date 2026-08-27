<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Company;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Sale;
use App\Models\Expense;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::firstOrCreate(['name' => 'Medixa HQ']);
        
        $admin = User::firstOrCreate(
            ['email' => 'admin@medixa.com'],
            ['name' => 'System Admin', 'password' => bcrypt('password'), 'company_id' => $company->id, 'is_company_owner' => true]
        );
        
        $user = User::firstOrCreate(
            ['email' => 'stivenimanzi1@gmail.com'],
            ['name' => 'Steven Imanzi', 'password' => bcrypt('Enterin@12'), 'company_id' => $company->id, 'is_company_owner' => true]
        );

        if (Product::count() === 0) {
            for ($i=0; $i<50; $i++) {
                Product::create([
                    'company_id' => $company->id,
                    'name' => 'Medicine ' . $i,
                    'price' => rand(1000, 20000),
                    'stock_quantity' => rand(10, 500)
                ]);
            }
        }
        
        if (Customer::count() === 0) {
            for ($i=0; $i<20; $i++) {
                Customer::create([
                    'company_id' => $company->id,
                    'name' => 'Customer ' . $i,
                ]);
            }
        }

        if (Sale::count() === 0) {
            for ($i=6; $i>=0; $i--) {
                $month = Carbon::now()->subMonths($i);
                $count = rand(10, 30);
                for ($j=0; $j<$count; $j++) {
                    Sale::create([
                        'company_id' => $company->id,
                        'user_id' => $user->id,
                        'receipt_no' => '#RCT-' . Str::upper(Str::random(6)),
                        'total_amount' => rand(5000, 150000),
                        'payment_method' => ['Cash', 'Card', 'Mobile Money'][rand(0,2)],
                        'created_at' => $month->copy()->addDays(rand(1, 28))
                    ]);
                }
                
                $expCount = rand(3, 8);
                for ($j=0; $j<$expCount; $j++) {
                    Expense::create([
                        'company_id' => $company->id,
                        'user_id' => $user->id,
                        'amount' => rand(10000, 100000),
                        'description' => 'Office supplies',
                        'expense_date' => $month->copy()->addDays(rand(1, 28))
                    ]);
                }
            }
        }
    }
}
