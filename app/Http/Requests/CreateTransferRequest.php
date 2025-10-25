<?php

namespace App\Http\Requests;

use App\Models\Product;
use App\Models\Store;
use App\Models\Transfer;
use App\Services\ProductSyncService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Validator;

class CreateTransferRequest extends FormRequest
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
        return Transfer::$rules;
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $userId = Auth::id();
            $fromStoreId = $this->input('from_store_id');
            $toStoreId = $this->input('to_store_id');

            // Check if from_store_id and to_store_id are the same
            if ($fromStoreId && $toStoreId && $fromStoreId == $toStoreId) {
                $validator->errors()->add('to_store_id', __('messages.transfer.same_store_error'));
                return;
            }

            // Validate from_store
            if ($fromStoreId) {
                $fromStore = Store::find($fromStoreId);
                if (!$fromStore) {
                    $validator->errors()->add('from_store_id', __('messages.transfer.store_not_found'));
                } elseif ($fromStore->user_id != $userId) {
                    $validator->errors()->add('from_store_id', __('messages.transfer.store_not_owned'));
                } elseif (!$fromStore->status) {
                    $validator->errors()->add('from_store_id', __('messages.transfer.store_inactive'));
                }
            }

            // Validate to_store
            if ($toStoreId) {
                $toStore = Store::find($toStoreId);
                if (!$toStore) {
                    $validator->errors()->add('to_store_id', __('messages.transfer.store_not_found'));
                } elseif ($toStore->user_id != $userId) {
                    $validator->errors()->add('to_store_id', __('messages.transfer.store_not_owned'));
                } elseif (!$toStore->status) {
                    $validator->errors()->add('to_store_id', __('messages.transfer.store_inactive'));
                }
            }

            // Product conflict validation removed to allow multiple transfers with same product code
            // The system will now update existing products instead of rejecting transfers
        });
    }
}
