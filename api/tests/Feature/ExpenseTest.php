<?php

use App\Models\Category;
use App\Models\Expense;
use App\Models\User;
use App\Models\Vendor;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

test('an expense can be created', function () {
    $category = Category::factory()->create();

    $this->postJson('/api/expenses', [
        'date' => '2026-08-15',
        'category_id' => $category->id,
        'vendor_id' => null,
        'content' => 'ランチ代',
        'amount' => 1500,
        'memo' => 'ランチ',
    ])->assertCreated()->assertJsonPath('amount', 1500)->assertJsonPath('date', '2026-08-15');
});

test('content is optional', function () {
    $category = Category::factory()->create();

    $this->postJson('/api/expenses', [
        'date' => '2026-08-15',
        'category_id' => $category->id,
        'amount' => 500,
    ])->assertCreated();
});

test('required fields are validated', function () {
    $this->postJson('/api/expenses', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['date', 'category_id', 'amount']);
});

test('a vendor from a different category is rejected', function () {
    $categoryA = Category::factory()->create();
    $categoryB = Category::factory()->create();
    $vendor = Vendor::factory()->create(['category_id' => $categoryB->id]);

    $this->postJson('/api/expenses', [
        'date' => '2026-08-15',
        'category_id' => $categoryA->id,
        'vendor_id' => $vendor->id,
        'content' => 'テスト',
        'amount' => 1000,
    ])->assertUnprocessable()->assertJsonValidationErrors(['vendor_id']);
});

test('expenses are listed for the requested month only', function () {
    $category = Category::factory()->create();
    Expense::factory()->create(['category_id' => $category->id, 'date' => '2026-08-01']);
    Expense::factory()->create(['category_id' => $category->id, 'date' => '2026-08-31']);
    Expense::factory()->create(['category_id' => $category->id, 'date' => '2026-09-01']);

    $response = $this->getJson('/api/expenses?year=2026&month=8');

    $response->assertOk();
    expect($response->json())->toHaveCount(2);
});

test('the settlement month defaults to the date\'s own month when omitted', function () {
    $category = Category::factory()->create();

    $response = $this->postJson('/api/expenses', [
        'date' => '2026-07-04',
        'category_id' => $category->id,
        'amount' => 4417,
    ])->assertCreated();

    $this->assertDatabaseHas('expenses', [
        'id' => $response->json('id'),
        'settlement_year' => 2026,
        'settlement_month' => 7,
    ]);
});

test('an explicit settlement month is honored even when it differs from the date', function () {
    $category = Category::factory()->create();

    // A card purchase made in July, billed (and budgeted) in August.
    $response = $this->postJson('/api/expenses', [
        'date' => '2026-07-04',
        'settlement_year' => 2026,
        'settlement_month' => 8,
        'category_id' => $category->id,
        'amount' => 4417,
    ])->assertCreated();

    $this->assertDatabaseHas('expenses', [
        'id' => $response->json('id'),
        'date' => '2026-07-04',
        'settlement_year' => 2026,
        'settlement_month' => 8,
    ]);

    // It shows up under August's list (the settlement month), not July.
    expect($this->getJson('/api/expenses?year=2026&month=7')->json())->toHaveCount(0);
    expect($this->getJson('/api/expenses?year=2026&month=8')->json())->toHaveCount(1);
});

test('an expense can be updated and deleted', function () {
    $expense = Expense::factory()->create(['date' => '2026-08-15']);

    $this->putJson("/api/expenses/{$expense->id}", [
        'date' => '2026-08-16',
        'category_id' => $expense->category_id,
        'vendor_id' => null,
        'content' => '更新後の内容',
        'amount' => 999,
        'memo' => null,
    ])->assertOk()->assertJsonPath('amount', 999);

    $this->deleteJson("/api/expenses/{$expense->id}")->assertNoContent();
    $this->assertDatabaseMissing('expenses', ['id' => $expense->id]);
});
