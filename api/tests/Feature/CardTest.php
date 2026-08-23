<?php

use App\Models\Card;
use App\Models\CardBill;
use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

test('a card can be created, updated, and deleted', function () {
    $response = $this->postJson('/api/cards', ['name' => '楽天カード'])
        ->assertCreated();

    $cardId = $response->json('id');

    $this->putJson("/api/cards/{$cardId}", ['name' => '楽天カード（更新）'])
        ->assertOk()
        ->assertJsonPath('name', '楽天カード（更新）');

    $this->deleteJson("/api/cards/{$cardId}")->assertNoContent();
});

test('a card cannot be deleted while bills reference it', function () {
    $card = Card::factory()->create();
    CardBill::create(['card_id' => $card->id, 'year' => 2026, 'month' => 8, 'amount' => 1000]);

    $this->deleteJson("/api/cards/{$card->id}")->assertStatus(409);
});
