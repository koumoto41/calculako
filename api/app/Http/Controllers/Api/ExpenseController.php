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
            ->whereYear('date', $validated['year'])
            ->whereMonth('date', $validated['month'])
            ->orderBy('date')
            ->get();
    }

    public function store(StoreExpenseRequest $request)
    {
        $validated = $request->validated();
        $date = new \DateTimeImmutable($validated['date']);
        $this->monthLock->assertOpen((int) $date->format('Y'), (int) $date->format('n'));

        return response()->json(Expense::create($validated), 201);
    }

    public function update(UpdateExpenseRequest $request, Expense $expense)
    {
        $this->monthLock->assertOpen((int) $expense->date->format('Y'), (int) $expense->date->format('n'));

        $validated = $request->validated();
        $newDate = new \DateTimeImmutable($validated['date']);
        $this->monthLock->assertOpen((int) $newDate->format('Y'), (int) $newDate->format('n'));

        $expense->update($validated);

        return $expense;
    }

    public function destroy(Expense $expense)
    {
        $this->monthLock->assertOpen((int) $expense->date->format('Y'), (int) $expense->date->format('n'));

        $expense->delete();

        return response()->noContent();
    }
}
