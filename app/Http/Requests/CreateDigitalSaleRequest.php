<?php

namespace App\Http\Requests;

use App\Models\DigitalSale;
use Illuminate\Foundation\Http\FormRequest;

class CreateDigitalSaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => 'required|date',
            'provider_id' => 'required|exists:providers,id',
            'cost' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'note' => 'nullable|string',
            'description' => 'nullable|string',
            'status' => 'nullable|integer|in:1,2,3',
        ];
    }

    public function messages(): array
    {
        return [
            'provider_id.required' => 'Provider is required',
            'provider_id.exists' => 'Selected provider does not exist',
            'cost.required' => 'Cost is required',
            'cost.numeric' => 'Cost must be a number',
            'cost.min' => 'Cost cannot be negative',
            'price.required' => 'Price is required',
            'price.numeric' => 'Price must be a number',
            'price.min' => 'Price cannot be negative',
        ];
    }
}
