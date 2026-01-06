<?php

namespace App\Http\Requests;

use App\Models\DigitalPurchaseTransaction;
use App\Models\Provider;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class CreateDigitalPurchaseTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = DigitalPurchaseTransaction::$rules;

        // Additional validation: check provider balance if cost is provided
        $providerId = $this->input('provider_id');
        $cost = $this->input('cost', 0);
        $quantity = $this->input('quantity', 1);

        if ($providerId && $cost > 0) {
            $provider = Provider::find($providerId);
            if ($provider && $provider->saldo < ($cost * $quantity)) {
                $this->merge(['balance_error' => true]);
            }
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'provider_id.required' => 'Provider harus dipilih',
            'provider_id.exists' => 'Provider tidak ditemukan',
            'cost.required' => 'Cost (biaya modal) harus diisi',
            'cost.numeric' => 'Cost harus berupa angka',
            'cost.min' => 'Cost tidak boleh negatif',
            'price.required' => 'Price (harga jual) harus diisi',
            'price.numeric' => 'Price harus berupa angka',
            'price.min' => 'Price tidak boleh negatif',
            'quantity.required' => 'Quantity harus diisi',
            'quantity.integer' => 'Quantity harus berupa bilangan bulat',
            'quantity.min' => 'Quantity minimal 1',
        ];
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'user_id' => Auth::id(),
        ]);
    }
}
