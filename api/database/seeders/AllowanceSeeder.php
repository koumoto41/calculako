<?php

namespace Database\Seeders;

use App\Models\Allowance;
use Illuminate\Database\Seeder;

class AllowanceSeeder extends Seeder
{
    public function run(): void
    {
        Allowance::current();
    }
}
