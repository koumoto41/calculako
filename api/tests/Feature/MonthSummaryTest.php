<?php

use App\Models\Allowance;
use App\Models\Card;
use App\Models\CardBill;
use App\Models\Category;
use App\Models\Expense;
use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

test('the month summary computes totals, category breakdown, and the balance formula', function () {
    Allowance::current()->update(['amount' => 35000]);

    $groceries = Category::factory()->create(['name' => 'スーパー']);
    $convenience = Category::factory()->create(['name' => 'コンビニ']);

    Expense::factory()->create(['category_id' => $groceries->id, 'date' => '2026-08-03', 'amount' => 3000]);
    Expense::factory()->create(['category_id' => $groceries->id, 'date' => '2026-08-20', 'amount' => 2000]);
    Expense::factory()->create(['category_id' => $convenience->id, 'date' => '2026-08-10', 'amount' => 500]);
    // Different month — must not be included.
    Expense::factory()->create(['category_id' => $groceries->id, 'date' => '2026-09-01', 'amount' => 9999]);

    $card = Card::factory()->create();
    CardBill::create(['card_id' => $card->id, 'year' => 2026, 'month' => 8, 'amount' => 4500]);

    $response = $this->getJson('/api/months/2026/8/summary');

    $response->assertOk();
    $response->assertJson([
        'is_closed' => false,
        'expense_total' => 5500,
        'card_bill_total' => 4500,
        'allowance' => 35000,
        // 35000 (allowance) + 5500 (expense_total) - 4500 (card_bill_total)
        'balance' => 36000,
    ]);

    $breakdown = collect($response->json('category_breakdown'))->keyBy('category_name');
    expect($breakdown['スーパー']['total'])->toBe(5000);
    expect($breakdown['コンビニ']['total'])->toBe(500);
});

test('an expense settled in a different month than its date is aggregated under the settlement month', function () {
    $category = Category::factory()->create();

    // Purchased in July, but settled (billed) in August.
    Expense::factory()->create([
        'category_id' => $category->id,
        'date' => '2026-07-28',
        'settlement_year' => 2026,
        'settlement_month' => 8,
        'amount' => 4417,
    ]);

    expect($this->getJson('/api/months/2026/7/summary')->json('expense_total'))->toBe(0);
    expect($this->getJson('/api/months/2026/8/summary')->json('expense_total'))->toBe(4417);
});

test('the summary reflects is_closed once a month is finalized', function () {
    $this->postJson('/api/months/2026/8/close')->assertOk();

    $this->getJson('/api/months/2026/8/summary')
        ->assertOk()
        ->assertJsonPath('is_closed', true);
});
