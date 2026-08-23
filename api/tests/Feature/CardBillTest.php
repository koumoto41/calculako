<?php

use App\Models\Card;
use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

test('card bills can be saved and listed for a month', function () {
    $card = Card::factory()->create();

    $this->putJson('/api/card-bills', [
        'year' => 2026,
        'month' => 8,
        'bills' => [['card_id' => $card->id, 'amount' => 12000]],
    ])->assertNoContent();

    $response = $this->getJson('/api/card-bills?year=2026&month=8');

    $response->assertOk();
    expect($response->json())->toHaveCount(1);
    expect($response->json('0.amount'))->toBe(12000);
});

test('saving a card bill for the same card and month again updates it instead of duplicating', function () {
    $card = Card::factory()->create();

    $this->putJson('/api/card-bills', [
        'year' => 2026,
        'month' => 8,
        'bills' => [['card_id' => $card->id, 'amount' => 1000]],
    ])->assertNoContent();

    $this->putJson('/api/card-bills', [
        'year' => 2026,
        'month' => 8,
        'bills' => [['card_id' => $card->id, 'amount' => 2000]],
    ])->assertNoContent();

    $this->assertDatabaseCount('card_bills', 1);
    $this->assertDatabaseHas('card_bills', ['card_id' => $card->id, 'amount' => 2000]);
});
