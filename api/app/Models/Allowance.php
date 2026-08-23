<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['amount'])]
class Allowance extends Model
{
    public static function current(): self
    {
        $allowance = static::firstOrCreate([], ['amount' => 35000]);

        // firstOrCreate() may lazily insert the single settings row on first
        // access. From callers' perspective this is a read, not a create, so
        // don't let Laravel's Model-return-status heuristic turn a GET/PUT
        // into an HTTP 201.
        $allowance->wasRecentlyCreated = false;

        return $allowance;
    }
}
