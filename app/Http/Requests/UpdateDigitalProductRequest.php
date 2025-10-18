<?php

namespace App\Http\Requests;

use App\Models\DigitalProduct;
use Illuminate\Foundation\Http\FormRequest;

class UpdateDigitalProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $rules = DigitalProduct::rules();

        // Make code unique except for current record
        $rules['code'] = 'required|string|unique:digital_products,code,' . $this->route('digital_product') . ',id,tenant_id,' . auth()->user()->tenant_id;

        return $rules;
    }

    public function messages(): array
    {
        return [
            'code.unique' => __('messages.error.code_taken'),
            'images.*.max' => __('messages.error.images_max_size'),
        ];
    }
}