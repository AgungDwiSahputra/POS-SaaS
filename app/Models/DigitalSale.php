<?php

namespace App\Models;

use App\Models\Contracts\JsonResourceful;
use App\Traits\HasJsonResourcefulData;
use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DigitalSale extends BaseModel implements JsonResourceful
{
    use HasFactory, HasJsonResourcefulData, Multitenantable;

    protected $table = 'digital_sales';
    public const JSON_API_TYPE = 'digital_sales';

    protected $fillable = [
        'date',
        'provider_id',
        'cost',
        'price',
        'margin',
        'note',
        'description',
        'status',
        'reference_code',
        'user_id',
        'tenant_id',
    ];

    // Status Constants
    public const COMPLETED = 1;
    public const PENDING = 2;
    public const CANCELLED = 3;

    public static $rules = [
        'date' => 'required|date',
        'provider_id' => 'required|exists:providers,id',
        'cost' => 'required|numeric|min:0',
        'price' => 'required|numeric|min:0',
        'margin' => 'nullable|numeric',
        'note' => 'nullable|string',
        'description' => 'nullable|string',
        'status' => 'required|integer|in:1,2,3',
        'reference_code' => 'nullable|string',
        'items' => 'required|array|min:1',
        'items.*.digital_product_id' => 'required|exists:digital_products,id',
        'items.*.quantity' => 'required|integer|min:1',
        'items.*.price' => 'required|numeric|min:0',
        'items.*.cost' => 'required|numeric|min:0',
    ];

    protected $casts = [
        'date' => 'date',
        'cost' => 'double',
        'price' => 'double',
        'margin' => 'double',
        'status' => 'integer',
    ];

    public function prepareLinks(): array
    {
        return [
            'self' => route('digital-sales.show', $this->id),
        ];
    }

    public function prepareAttributes(): array
    {
        $firstName = $this->user->first_name ?? '';
        $lastName = $this->user->last_name ?? 'N/A';

        // Prepare items data
        $items = $this->digitalSaleItems->map(function ($item) {
            return [
                'id' => $item->id,
                'digital_product_id' => $item->digital_product_id,
                'digital_product_name' => $item->digitalProduct->name ?? 'N/A',
                'digital_product_code' => $item->digitalProduct->code ?? 'N/A',
                'product_price' => $item->product_price,
                'quantity' => $item->quantity,
                'sub_total' => $item->sub_total,
                'cost' => $item->digitalProduct->cost ?? 0,
            ];
        })->toArray();

        $fields = [
            'date' => $this->date,
            'provider_id' => $this->provider_id,
            'provider_name' => $this->provider->nama_provider ?? 'N/A',
            'provider_saldo' => $this->provider->saldo ?? 0,
            'items' => $items,
            'cost' => $this->cost,
            'price' => $this->price,
            'margin' => $this->margin,
            'note' => $this->note,
            'description' => $this->description,
            'status' => $this->status,
            'status_label' => $this->getStatusLabel(),
            'reference_code' => $this->reference_code,
            'user_name' => $firstName . ' ' . $lastName,
            'created_at' => $this->created_at,
        ];

        return $fields;
    }

    public function getStatusLabel(): string
    {
        return match($this->status) {
            self::COMPLETED => 'Completed',
            self::PENDING => 'Pending',
            self::CANCELLED => 'Cancelled',
            default => 'Unknown',
        };
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class, 'provider_id', 'id');
    }

    public function digitalSaleItems(): HasMany
    {
        return $this->hasMany(DigitalSaleItem::class, 'digital_sale_id', 'id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    // Calculate margin automatically
    public function calculateMargin(): float
    {
        return $this->price - $this->cost;
    }

    // Check if provider has sufficient balance
    public function hasSufficientBalance(Provider $provider, float $cost): bool
    {
        return $provider->saldo >= $cost;
    }

    // Deduct balance from provider
    public function deductProviderBalance(Provider $provider, float $cost): void
    {
        $provider->saldo -= $cost;
        $provider->save();
    }
}
