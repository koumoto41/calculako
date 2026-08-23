<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['year', 'month', 'closed_at'])]
class MonthClosure extends Model
{
    protected function casts(): array
    {
        return [
            'closed_at' => 'datetime',
        ];
    }

    public static function isClosed(int $year, int $month): bool
    {
        return static::query()
            ->where('year', $year)
            ->where('month', $month)
            ->exists();
    }
}
