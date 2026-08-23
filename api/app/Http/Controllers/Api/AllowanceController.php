<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Allowance;
use Illuminate\Http\Request;

class AllowanceController extends Controller
{
    public function show()
    {
        return Allowance::current();
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'amount' => ['required', 'integer', 'min:0'],
        ]);

        $allowance = Allowance::current();
        $allowance->update($validated);

        return $allowance;
    }
}
