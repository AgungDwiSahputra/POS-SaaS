<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateCashAdvanceIdentityRequest extends FormRequest
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
        return [
            'name' => 'required|string|max:191',
            'email' => 'nullable|email|max:191|unique:cash_advance_identities,email',
            'phone' => 'nullable|string|max:191',
            'department' => 'nullable|string|max:191',
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'type' => 'required|in:employee,contractor,other',
            'is_active' => 'boolean',
            'notes' => 'nullable|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Name is required.',
            'email.email' => 'Please provide a valid email address.',
            'email.unique' => 'This email is already registered.',
            'employee_id.unique' => 'This employee ID is already registered.',
            'type.required' => 'Type is required.',
            'type.in' => 'Type must be one of: employee, contractor, other.',
        ];
    }
}
