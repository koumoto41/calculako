<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVendorRequest;
use App\Http\Requests\UpdateVendorRequest;
use App\Models\Vendor;
use Illuminate\Http\Request;

class VendorController extends Controller
{
    public function index(Request $request)
    {
        $query = Vendor::query()->orderBy('name');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        return $query->get();
    }

    public function store(StoreVendorRequest $request)
    {
        return response()->json(Vendor::create($request->validated()), 201);
    }

    public function update(UpdateVendorRequest $request, Vendor $vendor)
    {
        $vendor->update($request->validated());

        return $vendor;
    }

    public function destroy(Vendor $vendor)
    {
        if ($vendor->expenses()->exists()) {
            abort(409, 'この購入先には経費が登録されているため削除できません。');
        }

        $vendor->delete();

        return response()->noContent();
    }
}
