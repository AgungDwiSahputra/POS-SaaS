<?php

namespace App\Http\Requests;

use App\Models\BalanceRequest;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class UpdateBalanceRequestRequest
 */
class UpdateBalanceRequestRequest extends FormRequest
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
        $rules = BalanceRequest::rules();

        // For update, provider_id and amount are not editable
        unset($rules['provider_id'], $rules['requested_amount']);

        // Only allow status change to approved/rejected for pending requests
        $rules['status'] = 'required|in:approved,rejected';

        return $rules;
    }
}
