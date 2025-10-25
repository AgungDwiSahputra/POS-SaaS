<?php

namespace App\Models;

use App\Traits\HasJsonResourcefulData;
use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

/**
 * App\Models\CashAdvanceIdentity
 *
 * @property int $id
 * @property string $name
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $employee_id
 * @property string|null $department
 * @property string|null $address
 * @property \Illuminate\Support\Carbon|null $date_of_birth
 * @property string $type
 * @property bool $is_active
 * @property string|null $notes
 * @property int|null $created_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class CashAdvanceIdentity extends BaseModel
{
    use HasFactory, HasJsonResourcefulData, BelongsToTenant, Multitenantable;

    protected $table = 'cash_advance_identities';

    public const JSON_API_TYPE = 'cash_advance_identities';

    public const TYPE_EMPLOYEE = 'employee';
    public const TYPE_CONTRACTOR = 'contractor';
    public const TYPE_OTHER = 'other';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'employee_id',
        'department',
        'address',
        'date_of_birth',
        'type',
        'is_active',
        'deactivated_at',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'is_active' => 'boolean',
    ];

    public static $rules = [
        'name' => 'required|string|max:191',
        'email' => 'nullable|email|max:191',
        'phone' => 'nullable|string|max:191',
        'department' => 'nullable|string|max:191',
        'address' => 'nullable|string',
        'date_of_birth' => 'nullable|date',
        'type' => 'required|in:employee,contractor,other',
        'is_active' => 'boolean',
        'notes' => 'nullable|string',
    ];

    public function prepareLinks(): array
    {
        return [
            'self' => route('cash-advance-identities.show', $this->id),
        ];
    }

    public function prepareAttributes(): array
    {
        $createdUser = $this->createdBy;
        $createdByName = '';
        if ($createdUser) {
            $createdByName = trim($createdUser->first_name . ' ' . $createdUser->last_name);
        }

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
            'created_by_name' => $createdByName,
            'total_outstanding' => $this->total_outstanding ?? 0,
            'total_paid' => $this->total_paid ?? 0,
            'total_amount' => $this->total_amount ?? 0,
            'total_advances' => $this->total_advances ?? 0,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    public function prepareIdentities(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'employee_id' => $this->employee_id,
            'department' => $this->department,
            'type' => $this->type,
        ];
    }

    public function cashAdvances(): HasMany
    {
        return $this->hasMany(CashAdvance::class, 'identity_id', 'id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by', 'id')->withoutGlobalScope('tenant');
    }

    /**
     * Scope for active identities
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for inactive identities
     */
    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    /**
     * Get total outstanding amount for this identity
     */
    public function getTotalOutstandingAttribute(): float
    {
        $totalAmount = $this->cashAdvances()->sum('amount');
        $totalPaid = $this->cashAdvances()->sum('paid_amount');
        return max(0, $totalAmount - $totalPaid);
    }

    /**
     * Get total paid amount for this identity
     */
    public function getTotalPaidAttribute(): float
    {
        return $this->cashAdvances()->sum('paid_amount');
    }

    /**
     * Get total amount for this identity
     */
    public function getTotalAmountAttribute(): float
    {
        return $this->cashAdvances()->sum('amount');
    }

    /**
     * Boot method to auto-generate employee_id
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->employee_id)) {
                $model->employee_id = static::generateEmployeeId();
            }
        });
    }

    /**
     * Generate unique employee ID
     */
    public static function generateEmployeeId(): int
    {
        $lastIdentity = static::withoutGlobalScopes()->orderBy('employee_id', 'desc')->first();
        $lastId = $lastIdentity ? $lastIdentity->employee_id : 0;
        return $lastId + 1;
    }

    /**
     * @var string[]
     */
    public static $availableRelations = [
        'created_by' => 'createdBy',
    ];
}
