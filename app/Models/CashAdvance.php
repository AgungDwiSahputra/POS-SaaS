<?php

namespace App\Models;

use App\Traits\HasJsonResourcefulData;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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

    protected $fillable = [
        'date',
        'warehouse_id',
        'issued_to_name',
        'issued_to_phone',
        'issued_to_email',
        'amount',
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
    ];

    protected $casts = [
        'date' => 'date',
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
            'reference_code' => $this->reference_code,
            'notes' => $this->notes,
            'recorded_by' => $this->recorded_by,
            'recorded_by_name' => $recordedByName,
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

    /**
     * @var string[]
     */
    public static $availableRelations = [
        'warehouse_id' => 'warehouse',
        'recorded_by' => 'recordedBy',
    ];
}
