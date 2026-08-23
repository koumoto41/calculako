<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExpenseRequest;
use App\Http\Requests\UpdateExpenseRequest;
use App\Models\Expense;
use App\Services\MonthLockService;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function __construct(private readonly MonthLockService $monthLock) {}

    public function index(Request $request)
    {
        $validated = $request->validate([
            'year' => ['required', 'integer'],
            'month' => ['required', 'integer', 'between:1,12'],
        ]);

        return Expense::query()
            ->where('settlement_year', $validated['year'])
            ->where('settlement_month', $validated['month'])
            ->orderBy('date')
            ->get();
    }

    public function store(StoreExpenseRequest $request)
    {
        $validated = $request->validated();
        $validated += $this->resolveSettlementMonth($validated);
        $this->monthLock->assertOpen($validated['settlement_year'], $validated['settlement_month']);

        return response()->json(Expense::create($validated), 201);
    }

    public function update(UpdateExpenseRequest $request, Expense $expense)
    {
        $this->monthLock->assertOpen($expense->settlement_year, $expense->settlement_month);

        $validated = $request->validated();
        $validated += $this->resolveSettlementMonth($validated);
        $this->monthLock->assertOpen($validated['settlement_year'], $validated['settlement_month']);

        $expense->update($validated);

        return $expense;
    }

    public function destroy(Expense $expense)
    {
        $this->monthLock->assertOpen($expense->settlement_year, $expense->settlement_month);

        $expense->delete();

        return response()->noContent();
    }

    /**
     * The settlement month (which month this expense counts toward) defaults
     * to the expense's own date - unless both fields are explicitly given,
     * which is how CSV imports register a purchase under a different
     * billing month than its actual transaction date.
     *
     * @param  array<string, mixed>  $validated
     * @return array<string, int>
     */
    private function resolveSettlementMonth(array $validated): array
    {
        if (isset($validated['settlement_year'], $validated['settlement_month'])) {
            return [];
        }

        $date = new \DateTimeImmutable($validated['date']);

        return [
            'settlement_year' => (int) $date->format('Y'),
            'settlement_month' => (int) $date->format('n'),
        ];
    }
}
