<?php

$models = [
    'Product' => <<<EOT
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Scopes\CompanyScope;
class Product extends Model {
    use HasFactory;
    protected \$guarded = [];
    protected static function booted() {
        static::addGlobalScope(new CompanyScope);
    }
}
EOT,
    'Customer' => <<<EOT
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Scopes\CompanyScope;
class Customer extends Model {
    use HasFactory;
    protected \$guarded = [];
    protected static function booted() {
        static::addGlobalScope(new CompanyScope);
    }
}
EOT,
    'Sale' => <<<EOT
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Scopes\CompanyScope;
class Sale extends Model {
    use HasFactory;
    protected \$guarded = [];
    protected static function booted() {
        static::addGlobalScope(new CompanyScope);
    }
    public function customer() { return \$this->belongsTo(Customer::class); }
    public function user() { return \$this->belongsTo(User::class); }
}
EOT,
    'Expense' => <<<EOT
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Scopes\CompanyScope;
class Expense extends Model {
    use HasFactory;
    protected \$guarded = [];
    protected static function booted() {
        static::addGlobalScope(new CompanyScope);
    }
}
EOT
];

foreach (\$models as \$name => \$content) {
    file_put_contents(__DIR__."/app/Models/{\$name}.php", \$content);
}

// Controller
\$controller = <<<EOT
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
    public function summary(Request \$request)
    {
        \$sevenDaysAgo = Carbon::now()->subDays(7);
        
        \$totalProducts = Product::count();
        \$totalRevenue = Sale::sum('total_amount');
        \$totalOrders = Sale::count();
        \$totalCustomers = Customer::count();

        // Income vs Expenses for last 7 months
        \$incomeExpenses = collect();
        \$profitInvestment = collect();
        
        for (\$i = 6; \$i >= 0; \$i--) {
            \$month = Carbon::now()->subMonths(\$i);
            \$monthName = \$month->format('M');
            
            \$income = Sale::whereYear('created_at', \$month->year)
                          ->whereMonth('created_at', \$month->month)
                          ->sum('total_amount');
                          
            \$expenses = Expense::whereYear('expense_date', \$month->year)
                             ->whereMonth('expense_date', \$month->month)
                             ->sum('amount');
                             
            \$incomeExpenses->push([
                'name' => \$monthName,
                'income' => \$income,
                'expenses' => \$expenses
            ]);
            
            \$profitInvestment->push([
                'name' => \$monthName,
                'profit' => max(0, \$income - \$expenses),
                'investment' => 5000000 // mock investment line
            ]);
        }

        \$recentSales = Sale::with(['user', 'customer'])->latest()->take(5)->get()->map(function(\$sale) {
            return [
                'receipt' => \$sale->receipt_no,
                'cashier' => \$sale->user ? \$sale->user->name : 'Unknown',
                'amount' => 'RWF ' . number_format(\$sale->total_amount),
                'payment' => \$sale->payment_method,
                'date' => \$sale->created_at->format('Y-m-d')
            ];
        });

        return response()->json([
            'stats' => [
                ['label' => 'Total Products', 'value' => number_format(\$totalProducts), 'trend' => '+0%'],
                ['label' => 'Total Revenue', 'value' => 'RWF ' . number_format(\$totalRevenue), 'trend' => '+0%'],
                ['label' => 'Total Orders', 'value' => number_format(\$totalOrders), 'trend' => '+0%'],
                ['label' => 'Customers', 'value' => number_format(\$totalCustomers), 'trend' => '+0%'],
            ],
            'incomeVsExpenses' => \$incomeExpenses,
            'profitVsInvestment' => \$profitInvestment,
            'recentSales' => \$recentSales
        ]);
    }
}
EOT;
file_put_contents(__DIR__."/app/Http/Controllers/Api/DashboardController.php", \$controller);

// Database Seeder
\$seeder = <<<EOT
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
        \$company = Company::firstOrCreate(['name' => 'Medixa HQ']);
        \$user = User::firstOrCreate(
            ['email' => 'stivenimanzi1@gmail.com'],
            ['name' => 'Steven Imanzi', 'password' => bcrypt('Enterin@12'), 'company_id' => \$company->id, 'is_company_owner' => true]
        );

        if (Product::count() === 0) {
            for (\$i=0; \$i<50; \$i++) {
                Product::create([
                    'company_id' => \$company->id,
                    'name' => 'Medicine ' . \$i,
                    'price' => rand(1000, 20000),
                    'stock_quantity' => rand(10, 500)
                ]);
            }
        }
        
        if (Customer::count() === 0) {
            for (\$i=0; \$i<20; \$i++) {
                Customer::create([
                    'company_id' => \$company->id,
                    'name' => 'Customer ' . \$i,
                ]);
            }
        }

        if (Sale::count() === 0) {
            for (\$i=6; \$i>=0; \$i--) {
                \$month = Carbon::now()->subMonths(\$i);
                \$count = rand(10, 30);
                for (\$j=0; \$j<\$count; \$j++) {
                    Sale::create([
                        'company_id' => \$company->id,
                        'user_id' => \$user->id,
                        'receipt_no' => '#RCT-' . Str::upper(Str::random(6)),
                        'total_amount' => rand(5000, 150000),
                        'payment_method' => ['Cash', 'Card', 'Mobile Money'][rand(0,2)],
                        'created_at' => \$month->copy()->addDays(rand(1, 28))
                    ]);
                }
                
                \$expCount = rand(3, 8);
                for (\$j=0; \$j<\$expCount; \$j++) {
                    Expense::create([
                        'company_id' => \$company->id,
                        'user_id' => \$user->id,
                        'amount' => rand(10000, 100000),
                        'description' => 'Office supplies',
                        'expense_date' => \$month->copy()->addDays(rand(1, 28))
                    ]);
                }
            }
        }
    }
}
EOT;
file_put_contents(__DIR__."/database/seeders/DatabaseSeeder.php", \$seeder);

// Routes
\$routes = file_get_contents(__DIR__."/routes/api.php");
if (strpos(\$routes, 'DashboardController') === false) {
    \$routes .= "\\nuse App\Http\Controllers\Api\DashboardController;\\n";
    \$routes = str_replace(
        "Route::middleware('auth:sanctum')->group(function () {",
        "Route::middleware('auth:sanctum')->group(function () {\\n    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);",
        \$routes
    );
    file_put_contents(__DIR__."/routes/api.php", \$routes);
}

echo "Files updated.\\n";
