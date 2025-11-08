<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

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

        // Get the current main product to compare with the new code
        // Try multiple route parameter names to find the product ID
        $productId = $this->route('id') ?? $this->route('product') ?? $this->route('main_product');
        $mainProduct = $productId ? \App\Models\MainProduct::find($productId) : null;

        $rules = [
            'name' => 'required',
            'product_unit' => 'required',
            'notes' => 'nullable',
            'images.*' => 'image|mimes:jpg,jpeg,png,svg',
        ];

        // Validate product_type - accept both numeric and string values
        if ($this->has('product_type')) {
            $productType = $this->input('product_type');
            Log::info("Received product type: " . $productType);

            // Handle null or empty product_type
            if (is_null($productType) || $productType === '') {
                Log::warning("Product type is null or empty, setting default");
                $this->merge(['product_type' => \App\Models\MainProduct::SINGLE_PRODUCT]);
            }
            // Convert string values to numeric if needed
            elseif (in_array($productType, ['single', 'Single', 'SINGLE'])) {
                $this->merge(['product_type' => \App\Models\MainProduct::SINGLE_PRODUCT]);
            } elseif (in_array($productType, ['variation', 'Variation', 'VARIABLE', 'variable'])) {
                $this->merge(['product_type' => \App\Models\MainProduct::VARIATION_PRODUCT]);
            }
            // Handle invalid string values
            elseif (!is_numeric($productType)) {
                Log::warning("Invalid product type string: " . $productType . ", setting default");
                $this->merge(['product_type' => \App\Models\MainProduct::SINGLE_PRODUCT]);
            }
            // Handle numeric values outside valid range
            elseif (!in_array((int)$productType, [\App\Models\MainProduct::SINGLE_PRODUCT, \App\Models\MainProduct::VARIATION_PRODUCT])) {
                Log::warning("Invalid product type number: " . $productType . ", setting default");
                $this->merge(['product_type' => \App\Models\MainProduct::SINGLE_PRODUCT]);
            }

            $rules['product_type'] = 'required|in:1,2';
        } else {
            // If no product_type is sent, use the existing one
            if ($mainProduct) {
                Log::info("Existing product type: " . $mainProduct->product_type);
                $this->merge(['product_type' => $mainProduct->product_type]);
                $rules['product_type'] = 'required|in:1,2';
            } else {
                // If no main product found, set a default value
                Log::info("No existing product found, setting default product type");
                $this->merge(['product_type' => \App\Models\MainProduct::SINGLE_PRODUCT]);
                $rules['product_type'] = 'required|in:1,2';
            }
        }

        // Only validate unique if the code is actually changed
        if ($mainProduct && $mainProduct->code != $this->input('product_code')) {
            $rules['product_code'] = 'required|unique:main_products,code,' . $productId . ',id,tenant_id,' . Auth::user()->tenant_id;
        } else {
            $rules['product_code'] = 'required';
        }

        return $rules;
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
