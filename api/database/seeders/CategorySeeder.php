<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        collect(['通販', 'コンビニ', 'スーパー', 'その他'])
            ->each(fn (string $name, int $index) => Category::firstOrCreate(
                ['name' => $name],
                ['sort_order' => $index],
            ));
    }
}
