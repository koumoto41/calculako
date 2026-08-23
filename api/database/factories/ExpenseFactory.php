<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Expense>
 */
class ExpenseFactory extends Factory
{
    protected $model = Expense::class;

    public function definition(): array
    {
        return [
            'date' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'category_id' => Category::factory(),
            'vendor_id' => null,
            'content' => fake()->words(3, true),
            'amount' => fake()->numberBetween(100, 10000),
            'memo' => null,
        ];
    }

    public function configure(): static
    {
        // Mirrors ExpenseController::resolveSettlementMonth() - default the
        // settlement month to whatever `date` ends up being (including any
        // override passed to create()/make()), unless the test explicitly
        // set settlement_year/settlement_month itself.
        return $this->afterMaking(function (Expense $expense) {
            if (is_null($expense->settlement_year) || is_null($expense->settlement_month)) {
                $date = Carbon::parse($expense->date);
                $expense->settlement_year = $date->year;
                $expense->settlement_month = $date->month;
            }
        });
    }
}
