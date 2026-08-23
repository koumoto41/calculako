<?php

use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

test('the allowance defaults to 35000', function () {
    $this->getJson('/api/allowance')
        ->assertOk()
        ->assertJsonPath('amount', 35000);
});

test('the allowance can be updated', function () {
    $this->putJson('/api/allowance', ['amount' => 40000])
        ->assertOk()
        ->assertJsonPath('amount', 40000);

    $this->getJson('/api/allowance')
        ->assertOk()
        ->assertJsonPath('amount', 40000);
});
