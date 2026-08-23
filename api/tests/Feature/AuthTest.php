<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('a user can log in with correct credentials', function () {
    $user = User::factory()->create(['password' => Hash::make('secret123')]);

    $response = $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'secret123',
    ]);

    $response->assertOk();
    $this->assertAuthenticatedAs($user);
});

test('a user cannot log in with incorrect credentials', function () {
    $user = User::factory()->create(['password' => Hash::make('secret123')]);

    $response = $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $response->assertUnprocessable();
    $this->assertGuest();
});

test('a logged in user can log out', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/logout');

    $response->assertNoContent();
    // Explicitly check the 'web' guard: the /api/logout route's own auth:sanctum
    // middleware switches the *default* guard to 'sanctum' for the rest of
    // this test process (Auth\Middleware\Authenticate::authenticate() calls
    // shouldUse()), which is a same-process testing artifact, not something
    // that happens across real separate HTTP requests. What logout() actually
    // clears is the 'web' session guard, so assert against that directly.
    $this->assertGuest('web');
});

test('guests receive 401 from /api/user', function () {
    $this->getJson('/api/user')->assertUnauthorized();
});

test('authenticated users receive their user from /api/user', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson('/api/user')
        ->assertOk()
        ->assertJsonPath('id', $user->id);
});
