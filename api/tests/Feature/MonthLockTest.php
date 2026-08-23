<?php

use App\Models\Card;
use App\Models\Expense;
use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

test('closing a month makes its expenses read-only', function () {
    $expense = Expense::factory()->create(['date' => '2026-08-15']);

    $this->postJson('/api/months/2026/8/close')->assertOk();

    $this->postJson('/api/expenses', [
        'date' => '2026-08-01',
        'category_id' => $expense->category_id,
        'content' => 'テスト',
        'amount' => 500,
    ])->assertStatus(403);

    $this->putJson("/api/expenses/{$expense->id}", [
        'date' => '2026-08-15',
        'category_id' => $expense->category_id,
        'content' => 'テスト',
        'amount' => 999,
    ])->assertStatus(403);

    $this->deleteJson("/api/expenses/{$expense->id}")->assertStatus(403);
});

test('other months remain editable after a month is closed', function () {
    $expense = Expense::factory()->create(['date' => '2026-08-15']);

    $this->postJson('/api/months/2026/8/close')->assertOk();

    $this->postJson('/api/expenses', [
        'date' => '2026-09-01',
        'category_id' => $expense->category_id,
        'content' => 'テスト',
        'amount' => 500,
    ])->assertCreated();
});

test('an expense cannot be moved into a closed month', function () {
    $expense = Expense::factory()->create(['date' => '2026-09-15']);

    $this->postJson('/api/months/2026/8/close')->assertOk();

    $this->putJson("/api/expenses/{$expense->id}", [
        'date' => '2026-08-20',
        'category_id' => $expense->category_id,
        'content' => 'テスト',
        'amount' => 500,
    ])->assertStatus(403);
});

test('closing an already closed month returns a conflict', function () {
    $this->postJson('/api/months/2026/8/close')->assertOk();
    $this->postJson('/api/months/2026/8/close')->assertStatus(409);
});

test('card bills for a closed month cannot be edited', function () {
    $card = Card::factory()->create();
    $this->postJson('/api/months/2026/8/close')->assertOk();

    $this->putJson('/api/card-bills', [
        'year' => 2026,
        'month' => 8,
        'bills' => [['card_id' => $card->id, 'amount' => 1000]],
    ])->assertStatus(403);
});

test('a closed month can be reopened, making it editable again', function () {
    $expense = Expense::factory()->create(['date' => '2026-08-15']);

    $this->postJson('/api/months/2026/8/close')->assertOk();
    $this->getJson('/api/months/2026/8/summary')->assertJsonPath('is_closed', true);

    $this->deleteJson('/api/months/2026/8/close')
        ->assertOk()
        ->assertJsonPath('is_closed', false);

    $this->getJson('/api/months/2026/8/summary')->assertJsonPath('is_closed', false);

    $this->putJson("/api/expenses/{$expense->id}", [
        'date' => '2026-08-15',
        'category_id' => $expense->category_id,
        'content' => '再編集',
        'amount' => 1234,
    ])->assertOk()->assertJsonPath('amount', 1234);
});

test('reopening a month that is not closed returns 404', function () {
    $this->deleteJson('/api/months/2026/8/close')->assertStatus(404);
});
