<?php

namespace App\Models;

use App\Traits\HasJsonResourcefulData;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * App\Models\CashAdvance
 *
 * @property int $id
 * @property string $date
 * @property int $warehouse_id
 * @property string $issued_to_name
 * @property string|null $issued_to_phone
 * @property string|null $issued_to_email
 * @property float $amount
 * @property string|null $reference_code
 * @property string|null $notes
 * @property int|null $recorded_by
 */
class CashAdvance extends BaseModel
{
    use HasFactory, HasJsonResourcefulData;

    protected $table = 'cash_advances';

    public const JSON_API_TYPE = 'cash_advances';

    public const STATUS_PENDING = 0;

    public const STATUS_PAID = 1;

    protected $fillable = [
        'date',
        'warehouse_id',
        'issued_to_name',
        'issued_to_phone',
        'issued_to_email',
        'amount',
        'paid_amount',
        'status',
        'reference_code',
        'notes',
        'recorded_by',
    ];

    public static $rules = [
        'date' => 'required|date',
        'warehouse_id' => 'required|exists:warehouses,id',
        'issued_to_name' => 'required|string|max:191',
        'issued_to_phone' => 'nullable|string|max:191',
        'issued_to_email' => 'nullable|email|max:191',
        'amount' => 'required|numeric',
        'notes' => 'nullable|string',
        'paid_amount' => 'nullable|numeric',
        'status' => 'nullable|integer',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'double',
        'paid_amount' => 'double',
        'status' => 'integer',
    ];

    public function prepareLinks(): array
    {
        return [
            'self' => route('cash-advances.show', $this->id),
        ];
    }

    public function prepareAttributes(): array
    {
        $recordedUser = $this->recordedBy;
        $recordedByName = '';
        if ($recordedUser) {
            $recordedByName = trim($recordedUser->first_name . ' ' . $recordedUser->last_name);
        }

        return [
            'date' => $this->date,
            'warehouse_id' => $this->warehouse_id,
            'warehouse_name' => $this->warehouse?->name,
            'issued_to_name' => $this->issued_to_name,
            'issued_to_phone' => $this->issued_to_phone,
            'issued_to_email' => $this->issued_to_email,
            'amount' => $this->amount,
            'paid_amount' => $this->paid_amount,
            'outstanding_amount' => max(0, ($this->amount - $this->paid_amount)),
            'status' => $this->status,
            'status_label' => $this->status === self::STATUS_PAID
                ? __('messages.cash_advance.status.paid')
                : __('messages.cash_advance.status.pending'),
            'reference_code' => $this->reference_code,
            'notes' => $this->notes,
            'recorded_by' => $this->recorded_by,
            'recorded_by_name' => $recordedByName,
            'payments_count' => $this->payments_count ?? $this->payments()->count(),
            'created_at' => $this->created_at,
        ];
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id', 'id');
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by', 'id')->withoutGlobalScope('tenant');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(CashAdvancePayment::class, 'cash_advance_id');
    }

    /**
     * @var string[]
     */
    public static $availableRelations = [
        'warehouse_id' => 'warehouse',
        'recorded_by' => 'recordedBy',
        'payments' => 'payments',
    ];
}
