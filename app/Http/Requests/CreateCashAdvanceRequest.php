<?php

namespace App\Http\Requests;

use App\Models\CashAdvance;
use App\Models\CashAdvanceIdentity;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateCashAdvanceRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = CashAdvance::$rules;
        
        // Add custom validation for identity_id to check if identity is active
        $rules['identity_id'] = [
            'required',
            'exists:cash_advance_identities,id',
            function ($attribute, $value, $fail) {
                $identity = CashAdvanceIdentity::find($value);
                if (!$identity) {
                    $fail(__('messages.cash_advance.identity_not_found'));
                } elseif (!$identity->is_active) {
                    $fail(__('messages.cash_advance.identity_inactive'));
                }
            },
        ];

        return $rules;
    }
}
