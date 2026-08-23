<?php

namespace App\Services;

use App\Models\MonthClosure;
use Symfony\Component\HttpKernel\Exception\HttpException;

class MonthLockService
{
    public function isClosed(int $year, int $month): bool
    {
        return MonthClosure::isClosed($year, $month);
    }

    public function assertOpen(int $year, int $month): void
    {
        if ($this->isClosed($year, $month)) {
            throw new HttpException(403, "{$year}年{$month}月は確定済みのため編集できません。");
        }
    }
}
