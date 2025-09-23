<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CashAdvanceIdentityResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'employee_id' => $this->employee_id,
            'department' => $this->department,
            'address' => $this->address,
            'date_of_birth' => $this->date_of_birth,
            'type' => $this->type,
            'is_active' => $this->is_active,
            'notes' => $this->notes,
            'created_by' => $this->created_by,
            'created_by_name' => $this->created_by_name ?? '',
            'total_outstanding' => $this->total_outstanding ?? 0,
            'total_paid' => $this->total_paid ?? 0,
            'total_amount' => $this->total_amount ?? 0,
            'total_advances' => $this->total_advances ?? 0,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
