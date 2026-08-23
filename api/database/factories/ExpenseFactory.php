<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Expense;
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
}
