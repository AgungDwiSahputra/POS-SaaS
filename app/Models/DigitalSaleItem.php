<?php

namespace App\Models;

use App\Models\Contracts\JsonResourceful;
use App\Traits\HasJsonResourcefulData;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DigitalSaleItem extends BaseModel implements JsonResourceful
{
    use HasFactory, HasJsonResourcefulData;

    protected $table = 'digital_sale_items';

    public const JSON_API_TYPE = 'digital_sale_items';

    protected $fillable = [
        'digital_sale_id',
        'digital_product_id',
        'product_price',
        'net_unit_price',
        'tax_type',
        'tax_value',
        'tax_amount',
        'discount_type',
        'discount_value',
        'discount_amount',
        'quantity',
        'sub_total',
    ];

    public static $rules = [
        'digital_sale_id' => 'required|exists:digital_sales,id',
        'digital_product_id' => 'required|exists:digital_products,id',
        'product_price' => 'nullable|numeric',
        'tax_type' => 'nullable|numeric',
        'tax_value' => 'nullable|numeric',
        'tax_amount' => 'nullable|numeric',
        'discount_type' => 'nullable|numeric',
        'discount_value' => 'nullable|numeric',
        'discount_amount' => 'nullable|numeric',
        'quantity' => 'nullable|numeric',
        'sub_total' => 'nullable|numeric',
    ];

    protected $casts = [
        'product_price' => 'double',
        'tax_amount' => 'double',
        'tax_value' => 'double',
        'discount_value' => 'double',
        'discount_amount' => 'double',
        'quantity' => 'double',
        'sub_total' => 'double',
    ];

    public function prepareLinks(): array
    {
        return [];
    }

    public function prepareAttributes(): array
    {
        $fields = [
            'digital_product_id' => $this->digital_product_id,
            'digital_product_name' => $this->digitalProduct->name ?? '',
            'digital_product_code' => $this->digitalProduct->code ?? '',
            'net_unit_price' => $this->net_unit_price,
            'product_price' => $this->product_price,
            'tax_type' => $this->tax_type,
            'tax_value' => $this->tax_value,
            'tax_amount' => $this->tax_amount,
            'discount_type' => $this->discount_type,
            'discount_value' => $this->discount_value,
            'discount_amount' => $this->discount_amount,
            'quantity' => $this->quantity,
            'sub_total' => $this->sub_total,
        ];

        return $fields;
    }

    public function digitalSale(): BelongsTo
    {
        return $this->belongsTo(DigitalSale::class, 'digital_sale_id', 'id');
    }

    public function digitalProduct(): BelongsTo
    {
        return $this->belongsTo(DigitalProduct::class, 'digital_product_id', 'id');
    }
}
