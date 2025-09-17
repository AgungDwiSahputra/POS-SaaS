<?php

namespace App\Models;

use App\Traits\HasJsonResourcefulData;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashAdvancePayment extends BaseModel
{
    use HasFactory, HasJsonResourcefulData;

    protected $table = 'cash_advance_payments';

    public const JSON_API_TYPE = 'cash_advance_payments';

    protected $fillable = [
        'cash_advance_id',
        'paid_on',
        'amount',
        'notes',
        'recorded_by',
    ];

    protected $casts = [
        'paid_on' => 'date',
        'amount' => 'double',
    ];

    public static $rules = [
        'paid_on' => 'required|date',
        'amount' => 'required|numeric|min:0.01',
        'notes' => 'nullable|string',
    ];

    public function prepareLinks(): array
    {
        return [];
    }

    public function prepareAttributes(): array
    {
        $recordedUser = $this->recordedBy;
        $recordedByName = '';
        if ($recordedUser) {
            $recordedByName = trim($recordedUser->first_name . ' ' . $recordedUser->last_name);
        }

        return [
            'cash_advance_id' => $this->cash_advance_id,
            'paid_on' => $this->paid_on,
            'amount' => $this->amount,
            'notes' => $this->notes,
            'recorded_by' => $this->recorded_by,
            'recorded_by_name' => $recordedByName,
            'created_at' => $this->created_at,
        ];
    }

    public function cashAdvance(): BelongsTo
    {
        return $this->belongsTo(CashAdvance::class, 'cash_advance_id');
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by', 'id')->withoutGlobalScope('tenant');
    }

    /**
     * @var string[]
     */
    public static $availableRelations = [
        'cash_advance_id' => 'cashAdvance',
        'recorded_by' => 'recordedBy',
    ];
}
