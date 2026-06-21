<?php

namespace App\Repositories;

use App\Models\Provider;
use Illuminate\Support\Facades\Log;

/**
 * Class ProviderRepository
 */
class ProviderRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'nama_provider',
        'saldo',
        'deskripsi',
        'status',
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
    public function model()
    {
        return Provider::class;
    }

    public function create(array $attributes)
    {
        Log::info('ProviderRepository: create called', ['attributes' => $attributes]);
        $result = parent::create($attributes);
        Log::info('ProviderRepository: create result', ['id' => $result->id ?? null]);
        return $result;
    }

    public function update(array $attributes, $id)
    {
        Log::info('ProviderRepository: update called', ['id' => $id, 'attributes' => $attributes]);
        $result = parent::update($attributes, $id);
        Log::info('ProviderRepository: update result', ['id' => $result->id ?? null]);
        return $result;
    }

    public function delete($id)
    {
        Log::info('ProviderRepository: delete called', ['id' => $id]);
        $result = parent::delete($id);
        Log::info('ProviderRepository: delete result', ['result' => $result]);
        return $result;
    }
}