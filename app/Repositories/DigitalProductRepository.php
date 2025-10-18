<?php

namespace App\Repositories;

use App\Models\DigitalProduct;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Class DigitalProductRepository
 */
class DigitalProductRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'name',
        'code',
        'description',
        'price',
        'created_at',
    ];

    /**
     * Return searchable fields
     */
    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    /**
     * Configure the Model
     **/
    public function model(): string
    {
        return DigitalProduct::class;
    }

    /**
     * @return LengthAwarePaginator|Collection|mixed
     */
    public function storeDigitalProduct($input)
    {
        try {
            // Remove images from input before creating product to avoid mass assignment issues
            $images = [];
            if (isset($input['images']) && !empty($input['images'])) {
                $images = $input['images'];
                unset($input['images']);
            }

            $digitalProduct = $this->create($input);

            // Handle multiple images upload if exists
            if (!empty($images)) {
                foreach ($images as $image) {
                    $digitalProduct->addMedia($image)
                        ->toMediaCollection(DigitalProduct::PATH, config('app.media_disc'));
                }
            }

            return $digitalProduct;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error in DigitalProductRepository@storeDigitalProduct: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * @return LengthAwarePaginator|Collection|mixed
     */
    public function updateDigitalProduct($input, $id)
    {
        try {
            // Remove images from input before updating to avoid mass assignment issues
            $images = [];
            if (isset($input['images']) && !empty($input['images'])) {
                $images = $input['images'];
                unset($input['images']);
            }

            $digitalProduct = $this->update($input, $id);

            // Handle multiple images upload if exists
            if (!empty($images)) {
                // Clear existing media collection
                $digitalProduct->clearMediaCollection(DigitalProduct::PATH);

                foreach ($images as $image) {
                    $digitalProduct->addMedia($image)
                        ->toMediaCollection(DigitalProduct::PATH, config('app.media_disc'));
                }
            }

            return $digitalProduct;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error in DigitalProductRepository@updateDigitalProduct: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }
}