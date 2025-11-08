<?php

namespace App\Models;

use App\Models\Contracts\JsonResourceful;
use App\Traits\HasJsonResourcefulData;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Log;

/**
 * App\Models\StockMovement
 *
 * @property int $id
 * @property int $product_id
 * @property int $warehouse_id
 * @property float $quantity
 * @property string $type
 * @property string $reference_type
 * @property int|null $reference_id
 * @property float|null $old_hpp
 * @property float|null $new_hpp
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Product $product
 * @property-read \App\Models\Warehouse $warehouse
 *
 * @method static \Illuminate\Database\Eloquent\Builder|StockMovement newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|StockMovement newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|StockMovement query()
 * @method static \Illuminate\Database\Eloquent\Builder|StockMovement whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|StockMovement whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|StockMovement whereNewHpp($value)
 * @method static \Illuminate\Database\Eloquent\Builder|StockMovement whereOldHpp($value)
 * @method static \Illuminate\Database\Eloquent\Builder|StockMovement whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|StockMovement whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder|StockMovement whereReferenceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|StockMovement whereReferenceType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|StockMovement whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|StockMovement whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|StockMovement whereWarehouseId($value)
 *
 * @mixin \Eloquent
 */
class StockMovement extends BaseModel implements JsonResourceful
{
    use HasFactory, HasJsonResourcefulData;

    protected $table = 'stock_movements';

    public const JSON_API_TYPE = 'stock_movements';

    // Movement types
    const TYPE_PURCHASE = 'purchase';
    const TYPE_TRANSFER_IN = 'transfer_in';
    const TYPE_TRANSFER_OUT = 'transfer_out';
    const TYPE_SALE = 'sale';
    const TYPE_SALE_RETURN = 'sale_return';
    const TYPE_PURCHASE_RETURN = 'purchase_return';
    const TYPE_ADJUSTMENT = 'adjustment';
    const TYPE_INITIAL = 'initial';

    protected $fillable = [
        'product_id',
        'warehouse_id',
        'quantity',
        'type',
        'reference_type',
        'reference_id',
        'old_hpp',
        'new_hpp',
        'notes',
    ];

    protected $casts = [
        'product_id' => 'integer',
        'warehouse_id' => 'integer',
        'quantity' => 'float',
        'old_hpp' => 'float',
        'new_hpp' => 'float',
        'reference_id' => 'integer',
    ];

    public static $rules = [
        'product_id' => 'required|exists:products,id',
        'warehouse_id' => 'required|exists:warehouses,id',
        'quantity' => 'required|numeric',
        'type' => 'required|string',
        'reference_type' => 'required|string',
        'reference_id' => 'nullable|integer',
        'old_hpp' => 'nullable|numeric',
        'new_hpp' => 'nullable|numeric',
        'notes' => 'nullable|string',
    ];

    public function prepareLinks(): array
    {
        return [
            'self' => route('stock-movements.show', $this->id),
        ];
    }

    public function prepareAttributes(): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product_name' => $this->product->name ?? null,
            'product_code' => $this->product->code ?? null,
            'warehouse_id' => $this->warehouse_id,
            'warehouse_name' => $this->warehouse->name ?? null,
            'quantity' => $this->quantity,
            'type' => $this->type,
            'reference_type' => $this->reference_type,
            'reference_id' => $this->reference_id,
            'old_hpp' => $this->old_hpp,
            'new_hpp' => $this->new_hpp,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id', 'id');
    }

    /**
     * Create a stock movement record
     */
    public static function createMovement(array $data): self
    {
        $movement = new self($data);
        $movement->save();
        
        // Log the movement for debugging
        Log::info("Stock Movement Created", [
            'product_id' => $movement->product_id,
            'warehouse_id' => $movement->warehouse_id,
            'quantity' => $movement->quantity,
            'type' => $movement->type,
            'reference_type' => $movement->reference_type,
            'reference_id' => $movement->reference_id,
            'old_hpp' => $movement->old_hpp,
            'new_hpp' => $movement->new_hpp,
        ]);
        
        return $movement;
    }
}