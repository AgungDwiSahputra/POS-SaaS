<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateMainProductRequest extends FormRequest
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
        // if (request()->get('product_type') == 1) {
        //     $rules = Product::$rules;
        //     $rules['code'] = 'required|unique:main_products,code,' . $this->route('product');
        //     $rules['product_code'] = 'required';
        //     return $rules;
        // }

        // if (request()->get('product_type') == 2) {
        // $variationData = json_decode(request()->get('variation_data'), true);
        // $this->merge([
        //     'variation_data' => $variationData,
        // ]);

        return [
            'name' => 'required',
            'product_code' => 'required|unique:main_products,code,' . $this->route('id') . ',id,tenant_id,' . Auth::user()->tenant_id,
            'product_unit' => 'required',
            'product_type' => 'required|in:1,2',
            'notes' => 'nullable',
            'images.*' => 'image|mimes:jpg,jpeg,png,svg',
        ];
        // }

        // return Product::$rules;
    }

    public function messages(): array
    {
        return [
            'product_code.unique' => __('messages.error.code_taken'),
            'images.*.max' => __('messages.error.images_max_size'),
            'images.*.image' => __('messages.error.invalid_image'),
            'images.*.mimes' => __('messages.error.allowed_image_types'),
            'images.*' => __('messages.error.images_max_size'),
        ];
    }
}
