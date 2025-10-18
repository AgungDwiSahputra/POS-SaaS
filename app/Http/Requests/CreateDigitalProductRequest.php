<?php

namespace App\Http\Requests;

use App\Models\DigitalProduct;
use Illuminate\Foundation\Http\FormRequest;

class CreateDigitalProductRequest extends FormRequest
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
        return DigitalProduct::rules();
    }

    public function messages(): array
    {
        return [
            'code.unique' => __('messages.error.code_taken'),
            'images.*.max' => __('messages.error.images_max_size'),
        ];
    }
}