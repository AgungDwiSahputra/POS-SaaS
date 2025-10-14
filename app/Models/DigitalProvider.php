<?php

namespace App\Models;

use App\Models\Contracts\JsonResourceful;
use App\Traits\HasJsonResourcefulData;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Validation\Rule;

class DigitalProvider extends BaseModel implements JsonResourceful
{
    use HasFactory, HasJsonResourcefulData;

    protected $table = 'digital_providers';

    const JSON_API_TYPE = 'digital_providers';

    protected $fillable = [
        'name',
        'code',
        'description',
        'logo',
        'is_active',
        'settings',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'settings' => 'array',
    ];

    public static function rules(?int $ignoreId = null, bool $expectsFile = false): array
    {
        return [
            'name' => 'required|string|max:255',
            'code' => [
                'required',
                'string',
                'max:50',
                'regex:/^[A-Z0-9_]+$/',
                Rule::unique('digital_providers', 'code')->ignore($ignoreId),
            ],
            'description' => 'nullable|string',
            'logo' => $expectsFile
                ? 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048'
                : 'nullable|string',
            'is_active' => 'boolean',
        ];
    }

    public static function messages(): array
    {
        return [
            'name.required' => 'Nama provider wajib diisi.',
            'name.max' => 'Nama maksimal 255 karakter.',
            'code.required' => 'Kode provider wajib diisi.',
            'code.max' => 'Kode maksimal 50 karakter.',
            'code.regex' => 'Kode hanya boleh berisi huruf besar, angka, dan underscore.',
            'code.unique' => 'Kode provider sudah digunakan.',
            'description.max' => 'Deskripsi maksimal 500 karakter.',
            'logo.image' => 'File logo harus berupa gambar yang valid.',
            'logo.mimes' => 'Logo harus berupa file jpeg, png, jpg, gif, atau svg.',
            'logo.max' => 'Ukuran logo maksimal 2MB.',
        ];
    }

    public function prepareLinks(): array
    {
        return [
            'self' => route('digital-providers.show', $this->id),
        ];
    }

    public function prepareAttributes(): array
    {
        return [
            'id' => $this->id,
            'type' => self::JSON_API_TYPE,
            'attributes' => [
                'name' => $this->name,
                'code' => $this->code,
                'description' => $this->description,
                'logo' => $this->logo,
                'is_active' => $this->is_active,
                'settings' => $this->settings,
                'created_at' => $this->created_at,
            ],
        ];
    }

    /**
     * Get store digital providers for this provider
     */
    public function storeDigitalProviders(): HasMany
    {
        return $this->hasMany(StoreDigitalProvider::class);
    }

    /**
     * Get digital sales for this provider
     */
    public function digitalSales(): HasMany
    {
        return $this->hasMany(DigitalSale::class);
    }

    /**
     * Get topup requests for this provider
     */
    public function topupRequests(): HasMany
    {
        return $this->hasMany(DigitalTopupRequest::class);
    }

    /**
     * Get withdrawals for this provider
     */
    public function withdrawals(): HasMany
    {
        return $this->hasMany(DigitalWithdrawal::class);
    }

    /**
     * Scope untuk provider yang aktif
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
