<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['card_id', 'year', 'month', 'amount'])]
class CardBill extends Model
{
    public function card(): BelongsTo
    {
        return $this->belongsTo(Card::class);
    }
}
