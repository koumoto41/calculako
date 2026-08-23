<?php

use App\Models\Category;
use App\Models\Expense;
use App\Models\User;
use App\Models\Vendor;
use Database\Seeders\CategorySeeder;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

test('seeded default categories exist', function () {
    $this->seed(CategorySeeder::class);

    $names = Category::orderBy('sort_order')->pluck('name')->all();

    expect($names)->toEqual(['通販', 'コンビニ', 'スーパー', 'その他']);
});

test('a category can be created', function () {
    $this->postJson('/api/categories', ['name' => '趣味'])
        ->assertCreated()
        ->assertJsonPath('name', '趣味');

    $this->assertDatabaseHas('categories', ['name' => '趣味']);
});

test('a category name must be unique', function () {
    Category::factory()->create(['name' => '趣味']);

    $this->postJson('/api/categories', ['name' => '趣味'])
        ->assertUnprocessable();
});

test('a category can be updated', function () {
    $category = Category::factory()->create(['name' => '旧名']);

    $this->putJson("/api/categories/{$category->id}", ['name' => '新名'])
        ->assertOk()
        ->assertJsonPath('name', '新名');
});

test('a category cannot be deleted while vendors reference it', function () {
    $category = Category::factory()->create();
    Vendor::factory()->create(['category_id' => $category->id]);

    $this->deleteJson("/api/categories/{$category->id}")
        ->assertStatus(409);

    $this->assertDatabaseHas('categories', ['id' => $category->id]);
});

test('a category cannot be deleted while expenses reference it', function () {
    $category = Category::factory()->create();
    Expense::factory()->create(['category_id' => $category->id]);

    $this->deleteJson("/api/categories/{$category->id}")
        ->assertStatus(409);
});

test('an unreferenced category can be deleted', function () {
    $category = Category::factory()->create();

    $this->deleteJson("/api/categories/{$category->id}")
        ->assertNoContent();

    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});
