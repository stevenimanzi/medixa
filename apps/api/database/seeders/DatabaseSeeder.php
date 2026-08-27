<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $company = \App\Models\Company::create(['name' => 'Medixa HQ']);
        $branch = \App\Models\Branch::create(['name' => 'Main Pharmacy', 'company_id' => $company->id]);
        
        $admin = \App\Models\User::create([
            'name' => 'System Admin',
            'email' => 'admin@medixa.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'company_id' => $company->id,
            'is_company_owner' => true,
        ]);
        
        $admin->branches()->attach($branch->id);
    }
}
