<?php

use App\Models\Category;
use App\Models\Expense;
use App\Models\User;
use App\Models\Vendor;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

test('a vendor can be created under a category', function () {
    $category = Category::factory()->create();

    $this->postJson('/api/vendors', ['category_id' => $category->id, 'name' => 'Amazon'])
        ->assertCreated()
        ->assertJsonPath('name', 'Amazon');
});

test('vendor names must be unique within the same category but not across categories', function () {
    $categoryA = Category::factory()->create();
    $categoryB = Category::factory()->create();
    Vendor::factory()->create(['category_id' => $categoryA->id, 'name' => 'Amazon']);

    $this->postJson('/api/vendors', ['category_id' => $categoryA->id, 'name' => 'Amazon'])
        ->assertUnprocessable();

    $this->postJson('/api/vendors', ['category_id' => $categoryB->id, 'name' => 'Amazon'])
        ->assertCreated();
});

test('vendors can be filtered by category', function () {
    $categoryA = Category::factory()->create();
    $categoryB = Category::factory()->create();
    Vendor::factory()->create(['category_id' => $categoryA->id]);
    Vendor::factory()->create(['category_id' => $categoryB->id]);

    $response = $this->getJson("/api/vendors?category_id={$categoryA->id}");

    $response->assertOk();
    expect($response->json())->toHaveCount(1);
});

test('a vendor cannot be deleted while expenses reference it', function () {
    $vendor = Vendor::factory()->create();
    Expense::factory()->create(['category_id' => $vendor->category_id, 'vendor_id' => $vendor->id]);

    $this->deleteJson("/api/vendors/{$vendor->id}")->assertStatus(409);
});
