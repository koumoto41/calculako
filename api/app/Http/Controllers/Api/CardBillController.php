<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CardBill;
use App\Services\MonthLockService;
use Illuminate\Http\Request;

class CardBillController extends Controller
{
    public function __construct(private readonly MonthLockService $monthLock) {}

    public function index(Request $request)
    {
        $validated = $request->validate([
            'year' => ['required', 'integer'],
            'month' => ['required', 'integer', 'between:1,12'],
        ]);

        return CardBill::query()
            ->where('year', $validated['year'])
            ->where('month', $validated['month'])
            ->get(['card_id', 'year', 'month', 'amount']);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'year' => ['required', 'integer'],
            'month' => ['required', 'integer', 'between:1,12'],
            'bills' => ['required', 'array'],
            'bills.*.card_id' => ['required', 'integer', 'exists:cards,id'],
            'bills.*.amount' => ['required', 'integer', 'min:0'],
        ]);

        $this->monthLock->assertOpen($validated['year'], $validated['month']);

        foreach ($validated['bills'] as $bill) {
            CardBill::updateOrCreate(
                [
                    'card_id' => $bill['card_id'],
                    'year' => $validated['year'],
                    'month' => $validated['month'],
                ],
                ['amount' => $bill['amount']],
            );
        }

        return response()->noContent();
    }
}
