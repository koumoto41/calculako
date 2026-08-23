<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::query()->orderBy('sort_order');

        if ($request->boolean('with_vendors') || $request->query('with') === 'vendors') {
            $query->with('vendors');
        }

        return $query->get();
    }

    public function store(StoreCategoryRequest $request)
    {
        return response()->json(Category::create($request->validated()), 201);
    }

    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $category->update($request->validated());

        return $category;
    }

    public function destroy(Category $category)
    {
        if ($category->vendors()->exists() || $category->expenses()->exists()) {
            abort(409, 'この費目には購入先または経費が登録されているため削除できません。');
        }

        $category->delete();

        return response()->noContent();
    }
}
