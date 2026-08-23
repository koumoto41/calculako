<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Allowance;
use App\Models\CardBill;
use App\Models\Category;
use App\Models\Expense;
use App\Models\MonthClosure;
use App\Services\MonthLockService;

class MonthClosureController extends Controller
{
    public function __construct(private readonly MonthLockService $monthLock) {}

    public function summary(int $year, int $month)
    {
        $expenseTotal = (int) Expense::query()
            ->where('settlement_year', $year)
            ->where('settlement_month', $month)
            ->sum('amount');

        $categoryBreakdown = Category::query()
            ->orderBy('sort_order')
            ->get()
            ->map(function (Category $category) use ($year, $month) {
                $total = (int) $category->expenses()
                    ->where('settlement_year', $year)
                    ->where('settlement_month', $month)
                    ->sum('amount');

                return [
                    'category_id' => $category->id,
                    'category_name' => $category->name,
                    'total' => $total,
                ];
            })
            ->values();

        $cardBillTotal = (int) CardBill::query()
            ->where('year', $year)
            ->where('month', $month)
            ->sum('amount');

        $allowance = Allowance::current()->amount;

        return response()->json([
            'year' => $year,
            'month' => $month,
            'is_closed' => $this->monthLock->isClosed($year, $month),
            'expense_total' => $expenseTotal,
            'category_breakdown' => $categoryBreakdown,
            'card_bill_total' => $cardBillTotal,
            'allowance' => $allowance,
            'balance' => $allowance + $expenseTotal - $cardBillTotal,
        ]);
    }

    public function close(int $year, int $month)
    {
        if ($this->monthLock->isClosed($year, $month)) {
            abort(409, "{$year}年{$month}月は既に確定済みです。");
        }

        MonthClosure::create([
            'year' => $year,
            'month' => $month,
            'closed_at' => now(),
        ]);

        return response()->json(['year' => $year, 'month' => $month, 'is_closed' => true]);
    }

    public function reopen(int $year, int $month)
    {
        $closure = MonthClosure::query()->where('year', $year)->where('month', $month)->first();

        if (! $closure) {
            abort(404, "{$year}年{$month}月は確定されていません。");
        }

        $closure->delete();

        return response()->json(['year' => $year, 'month' => $month, 'is_closed' => false]);
    }
}
