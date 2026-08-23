<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCardRequest;
use App\Http\Requests\UpdateCardRequest;
use App\Models\Card;

class CardController extends Controller
{
    public function index()
    {
        return Card::query()->orderBy('name')->get();
    }

    public function store(StoreCardRequest $request)
    {
        return response()->json(Card::create($request->validated()), 201);
    }

    public function update(UpdateCardRequest $request, Card $card)
    {
        $card->update($request->validated());

        return $card;
    }

    public function destroy(Card $card)
    {
        if ($card->bills()->exists()) {
            abort(409, 'このカードには請求額が登録されているため削除できません。');
        }

        $card->delete();

        return response()->noContent();
    }
}
