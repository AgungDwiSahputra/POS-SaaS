<?php

namespace App\Repositories;

use App\Models\CashAdvanceIdentity;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class CashAdvanceIdentityRepository extends BaseRepository
{
    protected $fieldSearchable = [
        'name',
        'email',
        'phone',
        'department',
        'type',
        'is_active',
        'created_at',
    ];

    public function getAvailableRelations(): array
    {
        return array_values(CashAdvanceIdentity::$availableRelations);
    }

    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    public function model()
    {
        return CashAdvanceIdentity::class;
    }

    /**
     * @return LengthAwarePaginator|Collection|mixed
     */
    public function storeCashAdvanceIdentity(array $input)
    {
        try {
            DB::beginTransaction();
            if (empty($input['created_by']) && Auth::check()) {
                $input['created_by'] = Auth::id();
            }

            /** @var CashAdvanceIdentity $identity */
            $identity = $this->create($input);
            DB::commit();

            return $identity;
        } catch (Exception $exception) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }
    }

    /**
     * Get identities with their cash advance summary
     */
    public function getIdentitiesWithSummary(array $input = [])
    {
        $query = $this->model->withCount(['cashAdvances as total_advances'])
            ->withSum('cashAdvances as total_amount', 'amount')
            ->withSum('cashAdvances as total_paid', 'paid_amount');

        if (isset($input['is_active'])) {
            $query->where('is_active', $input['is_active']);
        }

        if (isset($input['type'])) {
            $query->where('type', $input['type']);
        }

        if (isset($input['search'])) {
            $search = $input['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('department', 'like', "%{$search}%");
            });
        }

        $identities = $query->orderBy('name')->get();
        
        // Add calculated fields
        $identities->each(function ($identity) {
            $identity->total_outstanding = $identity->total_amount - $identity->total_paid;
        });

        return $identities;
    }

    /**
     * Get identity with detailed cash advance history
     */
    public function getIdentityWithHistory($id)
    {
        return $this->model->with([
            'cashAdvances' => function ($query) {
                $query->with(['payments'])
                      ->orderBy('date', 'desc');
            }
        ])->findOrFail($id);
    }

    /**
     * Get active identities for dropdown
     */
    public function getActiveIdentitiesForSelect()
    {
        return $this->model->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($identity) {
                return [
                    'value' => $identity->id,
                    'label' => $identity->name . ($identity->employee_id ? " ({$identity->employee_id})" : ''),
                    'employee_id' => $identity->employee_id,
                    'department' => $identity->department,
                    'type' => $identity->type,
                ];
            });
    }

    /**
     * Get all identities without tenant scope
     */
    public function getAllWithoutTenantScope()
    {
        return $this->model->withoutGlobalScopes()->get();
    }
}
