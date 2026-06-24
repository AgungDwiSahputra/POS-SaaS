<?php

namespace App\Repositories;

use App\Models\Role;
use Exception;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Class RoleRepository
 */
class RoleRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'name',
        'display_name',
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
        return Role::class;
    }

    /**
     * @return \Illuminate\Database\Eloquent\Builder|\Illuminate\Database\Eloquent\Model
     */
    public function storeRole($input)
    {
        try {
            DB::beginTransaction();

            // Extract permissions from input
            $permissions = $input['permissions'] ?? [];

            // Prepare role data (only columns that exist in roles table)
            $roleData = [
                'name' => $input['name'],
                'display_name' => $input['name'],
                'guard_name' => $input['guard_name'] ?? 'web',
            ];

            // Add tenant_id if provided
            if (isset($input['tenant_id'])) {
                $roleData['tenant_id'] = $input['tenant_id'];
            }

            /** @var Role $role */
            $role = Role::create($roleData);

            // Sync permissions to role
            if (!empty($permissions)) {
                $role->syncPermissions($permissions);
            }

            DB::commit();

            return $role;
        } catch (Exception $exception) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }
    }

    /**
     * @return mixed
     */
    public function updateRole($input, $id)
    {
        try {
            DB::beginTransaction();

            // Extract permissions from input
            $permissions = $input['permissions'] ?? [];

            // Prepare role data (only columns that exist in roles table)
            $roleData = [
                'name' => $input['name'],
                'display_name' => $input['name'],
            ];

            // Add tenant_id if provided
            if (isset($input['tenant_id'])) {
                $roleData['tenant_id'] = $input['tenant_id'];
            }

            /** @var Role $role */
            $role = Role::withoutGlobalScope('tenant')->find($id);
            $role->update($roleData);

            // Sync permissions to role
            if (!empty($permissions)) {
                $role->syncPermissions($permissions);
            } else {
                // If empty permissions array, remove all permissions
                $role->syncPermissions([]);
            }

            DB::commit();

            return $role;
        } catch (Exception $exception) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }
    }
}
