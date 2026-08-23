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
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'vendor_id' => [
                'nullable',
                'integer',
                Rule::exists('vendors', 'id')->where('category_id', $this->input('category_id')),
            ],
            'content' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'integer', 'min:1'],
            'memo' => ['nullable', 'string'],
        ];
    }
}
