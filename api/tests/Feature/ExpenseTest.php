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

test('required fields are validated', function () {
    $this->postJson('/api/expenses', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['date', 'category_id', 'content', 'amount']);
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
