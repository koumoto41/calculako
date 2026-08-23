<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'date' => ['required', 'date'],
            // Which month this expense counts toward. Optional - if omitted,
            // the controller defaults both to the date's own year/month. Set
            // explicitly when the settlement month differs from the date
            // itself (e.g. a credit card purchase billed the following month).
            'settlement_year' => ['nullable', 'integer'],
            'settlement_month' => ['nullable', 'integer', 'between:1,12'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'vendor_id' => [
                'nullable',
                'integer',
                Rule::exists('vendors', 'id')->where('category_id', $this->input('category_id')),
            ],
            'content' => ['nullable', 'string', 'max:255'],
            'amount' => ['required', 'integer', 'min:1'],
            'memo' => ['nullable', 'string'],
        ];
    }
}
