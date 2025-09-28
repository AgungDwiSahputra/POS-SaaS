<?php

namespace App\Http\Resources;

class CashAdvanceResource extends BaseJsonResource
{
    public function toArray($request): array
    {
        // Load identity if not already loaded
        if (!$this->relationLoaded('identity')) {
            $this->load('identity');
        }
        
        return [
            'id' => $this->id,
            'date' => $this->date,
            'identity_id' => $this->identity_id,
            'identity_name' => $this->identity ? $this->identity->name : null,
            'identity_employee_id' => $this->identity ? $this->identity->employee_id : null,
            'amount' => $this->amount,
            'paid_amount' => $this->paid_amount,
            'outstanding_amount' => max(0, ($this->amount - $this->paid_amount)),
            'status' => $this->status,
            'status_label' => $this->status === 1 ? __('messages.cash_advance.status.paid') : __('messages.cash_advance.status.pending'),
            'reference_code' => $this->reference_code,
            'notes' => $this->notes,
            'recorded_by' => $this->recorded_by,
            'recorded_by_name' => $this->recordedBy ? $this->recordedBy->name : null,
            'payments_count' => $this->payments_count ?? $this->payments()->count(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
