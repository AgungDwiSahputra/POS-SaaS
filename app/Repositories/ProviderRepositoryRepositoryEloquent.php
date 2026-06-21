<?php

namespace App\Repositories;

use Prettus\Repository\Eloquent\BaseRepository;
use Prettus\Repository\Criteria\RequestCriteria;
use App\Repositories\ProviderRepositoryRepository;
use App\Entities\ProviderRepository;
use App\Validators\ProviderRepositoryValidator;

/**
 * Class ProviderRepositoryRepositoryEloquent.
 *
 * @package namespace App\Repositories;
 */
class ProviderRepositoryRepositoryEloquent extends BaseRepository implements ProviderRepositoryRepository
{
    /**
     * Specify Model class name
     *
     * @return string
     */
    public function model()
    {
        return ProviderRepository::class;
    }

    

    /**
     * Boot up the repository, pushing criteria
     */
    public function boot()
    {
        $this->pushCriteria(app(RequestCriteria::class));
    }
    
}
