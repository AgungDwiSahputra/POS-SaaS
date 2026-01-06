<?php

namespace App\Models;

use App\Models\Contracts\JsonResourceful;
use App\Traits\HasJsonResourcefulData;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Query\Builder;

class DigitalSalesPayment extends BaseModel implements JsonResourceful
{
    use HasFactory, HasJsonResourcefulData;

    protected $table = 'digital_sales_payments';

    public const JSON_API_TYPE = 'digital_sales_payments';

    public const CASH = 1;
    public const CHEQUE = 2;
    public const BANK_TRANSFER = 3;
    public const OTHER = 4;

    protected $with = ['paymentMethod'];

    protected $fillable = [
        'digital_sale_id',
        'reference',
        'payment_date',
        'payment_type',
        'amount',
        'received_amount',
    ];

    public static $rules = [
        'payment_date' => 'date',
        'amount' => 'required|numeric',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount' => 'double',
        'received_amount' => 'double',
        'payment_type' => 'integer',
    ];

    public function prepareLinks(): array
    {
        return [];
    }

    public function prepareAttributes(): array
    {
        $fields = [
            'digital_sale_id' => $this->digital_sale_id,
            'reference' => $this->reference,
            'payment_date' => $this->payment_date,
            'payment_type' => $this->payment_type,
            'amount' => $this->amount,
            'received_amount' => $this->received_amount,
        ];

        return $fields;
    }

    public function digitalSale(): BelongsTo
    {
        return $this->belongsTo(DigitalSale::class, 'digital_sale_id', 'id');
    }

    public function scopeUser(Builder $builder, $userId)
    {
        return $builder->whereHas('digitalSale', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        });
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class, 'payment_type', 'id');
    }
}
