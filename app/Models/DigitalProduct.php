<?php

namespace App\Models;

use App\Models\Contracts\JsonResourceful;
use App\Traits\HasJsonResourcefulData;
use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

/**
 * App\Models\DigitalProduct
 *
 * @property int $id
 * @property string $tenant_id
 * @property string $name
 * @property string $code
 * @property string|null $description
 * @property float $price
 * @property string|null $download_link
 * @property string|null $license_key
 * @property \Illuminate\Support\Carbon|null $expiry_date
 * @property int $max_downloads
 * @property string|null $file_path
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read string $image_url
 * @property-read \Spatie\MediaLibrary\MediaCollections\Models\Collections\MediaCollection|Media[] $media
 * @property-read int|null $media_count
 *
 * @method static \Illuminate\Database\Eloquent\Builder|DigitalProduct newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|DigitalProduct newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|DigitalProduct query()
 * @method static \Illuminate\Database\Eloquent\Builder|DigitalProduct whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DigitalProduct whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DigitalProduct whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DigitalProduct whereDownloadLink($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DigitalProduct whereExpiryDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DigitalProduct whereFilePath($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DigitalProduct whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DigitalProduct whereLicenseKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DigitalProduct whereMaxDownloads($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DigitalProduct whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DigitalProduct wherePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DigitalProduct whereTenantId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DigitalProduct whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class DigitalProduct extends Model implements HasMedia, JsonResourceful
{
    use HasFactory, InteractsWithMedia, HasJsonResourcefulData, BelongsToTenant, Multitenantable;

    protected $table = 'digital_products';

    const JSON_API_TYPE = 'digital_products';

    public const PATH = 'digital_product';

    protected $appends = ['image_url'];

    protected $fillable = [
        'tenant_id',
        'name',
        'code',
        'description',
        'price',
        'cost',
        'expiry_date',
        'file_path',
        'type',
    ];

    protected $casts = [
        'price' => 'float',
        'cost' => 'float',
        'expiry_date' => 'date',
    ];

    public static function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:digital_products,code,NULL,id,tenant_id,' . auth()->user()->tenant_id,
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'cost' => 'required|numeric|min:0',
            'expiry_date' => 'nullable|date|after:today',
            'file_path' => 'nullable|string|max:500',
            'type' => 'required|in:tarik_tunai,setor_tunai',
            'images.*' => 'image|mimes:jpg,jpeg,png,svg,pdf,zip|max:10240',
        ];
    }

    /**
     * @return array|string
     */
    public function getImageUrlAttribute()
    {
        /** @var Media $media */
        $medias = $this->getMedia(self::PATH);
        $images = [];
        if (!empty($medias)) {
            foreach ($medias as $key => $media) {
                $images['imageUrls'][$key] = $media->getFullUrl();
                $images['id'][$key] = $media->id;
            }

            return $images;
        }

        return '';
    }

    public function prepareLinks(): array
    {
        return [
            'self' => route('digital-products.show', $this->id),
        ];
    }

    public function prepareAttributes(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'price' => $this->price,
            'cost' => $this->cost,
            'expiry_date' => $this->expiry_date,
            'file_path' => $this->file_path,
            'type' => $this->type,
            'image_url' => $this->image_url,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    /**
     * @return string[]
     */
    public function getIdFilterFields(): array
    {
        return [
            'id' => self::class,
        ];
    }
}
