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
            'items' => 'required|array|min:1',
            'items.*.digital_product_id' => 'required|exists:digital_products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.cost' => 'required|numeric|min:0',
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
            'items.required' => 'At least one product is required',
            'items.array' => 'Items must be an array',
            'items.min' => 'At least one product is required',
            'items.*.digital_product_id.required' => 'Product ID is required for each item',
            'items.*.digital_product_id.exists' => 'Selected product does not exist',
            'items.*.quantity.required' => 'Quantity is required for each item',
            'items.*.quantity.integer' => 'Quantity must be a whole number',
            'items.*.quantity.min' => 'Quantity must be at least 1',
            'items.*.price.required' => 'Price is required for each item',
            'items.*.price.numeric' => 'Price must be a number',
            'items.*.price.min' => 'Price cannot be negative',
            'items.*.cost.required' => 'Cost is required for each item',
            'items.*.cost.numeric' => 'Cost must be a number',
            'items.*.cost.min' => 'Cost cannot be negative',
        ];
    }
}
