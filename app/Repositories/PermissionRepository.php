<?php

namespace App\Repositories;

use App\Models\Permission;
use Illuminate\Support\Str;
use App\Models\Subscription;
use Illuminate\Support\Facades\Auth;

/**
 * Class PermissionRepository
 */
class PermissionRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'name',
        'display_name',
    ];

    /**
     * @var string[]
     */
    protected $allowedFields = [
        'name',
        'description',
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
        return Permission::class;
    }

    public function getPermission($perPage)
    {
        $user = Auth::user();
        $currentSubscription = Subscription::where('user_id', $user->id)->where('status', Subscription::ACTIVE)->first();
        $restrictedPermissions = [];
        if (!empty($currentSubscription) && isset($currentSubscription->plan->planFeature)) {
            $subscriptionFeature = $currentSubscription->plan->planFeature;

            if (!$subscriptionFeature->pos_management) {
                $restrictedPermissions = array_merge($restrictedPermissions, ["manage_pos_screen"]);
            }
            if (!$subscriptionFeature->reports) {
                $restrictedPermissions = array_merge($restrictedPermissions, ["manage_reports"]);
            }
            if (!$subscriptionFeature->emails_support) {
                $restrictedPermissions = array_merge($restrictedPermissions, ["manage_email_templates"]);
            }
            if (!$subscriptionFeature->sms_support) {
                $restrictedPermissions = array_merge($restrictedPermissions, ["manage_sms_templates", "manage_sms_apis"]);
            }
            if (!$subscriptionFeature->inventory_management) {
                $restrictedPermissions = array_merge($restrictedPermissions, []);
            }
            if (!$subscriptionFeature->adjustments) {
                $restrictedPermissions = array_merge($restrictedPermissions, ["manage_adjustments"]);
            }
            if (!$subscriptionFeature->roles_permission) {
                $restrictedPermissions = array_merge($restrictedPermissions, ["manage_roles"]);
            }
        }

        // Get manage_* permissions
        $managePermissions = $this->model
            ->where('name', 'like', 'manage_%')
            ->whereNotIn('name', $restrictedPermissions)
            ->get();

        // Get standalone permissions (non-manage permissions that should appear separately)
        $standalonePermissionNames = ['create_balance_requests', 'delete_balance_requests'];
        $standalonePermissions = $this->model
            ->whereIn('name', $standalonePermissionNames)
            ->whereNotIn('name', $restrictedPermissions)
            ->get();

        $allPermissions = Permission::all(['id', 'name']);

        // Process manage permissions with their child permissions
        $managePermissions->each(function ($permission) use ($allPermissions) {
            $module = Str::after($permission->name, 'manage_');

            // Special modules that only have specific actions
            $viewOnlyModules = ['dashboard', 'pos_screen'];
            $editOnlyModules = ['reports', 'sms_templates', 'email_templates', 'sms_apis', 'setting'];
            $noChildModules = ['print_barcode', 'store']; // Modules without CRUD permissions

            if (in_array($module, $noChildModules)) {
                // For modules without child permissions, create a self-referencing child
                $permission->child_permissions = collect([
                    [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'selected' => false,
                        'is_self' => true, // Flag to indicate this is the permission itself
                    ]
                ]);
            } elseif (in_array($module, $viewOnlyModules)) {
                $childPermissions = collect(['view'])->map(function ($action) use ($module, $allPermissions) {
                    $name = "{$action}_{$module}";
                    $match = $allPermissions->firstWhere('name', $name);
                    if ($match) {
                        return [
                            'id' => $match->id,
                            'name' => $name,
                            'selected' => false,
                        ];
                    }
                    return null;
                })->filter()->values();
                $permission->child_permissions = $childPermissions;
            } elseif (in_array($module, $editOnlyModules)) {
                $childPermissions = collect(['edit'])->map(function ($action) use ($module, $allPermissions) {
                    $name = "{$action}_{$module}";
                    $match = $allPermissions->firstWhere('name', $name);
                    if ($match) {
                        return [
                            'id' => $match->id,
                            'name' => $name,
                            'selected' => false,
                        ];
                    }
                    return null;
                })->filter()->values();
                $permission->child_permissions = $childPermissions;
            } else {
                // Standard modules with full CRUD
                $childPermissions = collect(['edit', 'create', 'view', 'delete'])->map(function ($action) use ($module, $allPermissions) {
                    $name = "{$action}_{$module}";
                    $match = $allPermissions->firstWhere('name', $name);

                    if ($match) {
                        return [
                            'id' => $match->id,
                            'name' => $name,
                            'selected' => false,
                        ];
                    }
                    return null;
                })->filter()->values();

                $permission->child_permissions = $childPermissions;
            }
        });

        // Process standalone permissions (create_balance_requests, delete_balance_requests)
        // Group them under a virtual "balance_requests" parent
        $balanceRequestPermissions = $standalonePermissions->filter(function ($p) {
            return Str::contains($p->name, 'balance_requests');
        });

        if ($balanceRequestPermissions->count() > 0) {
            // Find or create virtual parent for balance_requests
            $manageBalanceRequests = $managePermissions->firstWhere('name', 'manage_balance_requests');
            
            if ($manageBalanceRequests) {
                // Add standalone permissions as additional children
                $existingChildren = $manageBalanceRequests->child_permissions ?? collect([]);
                
                foreach ($balanceRequestPermissions as $standalone) {
                    // Only add if not already exists
                    $exists = $existingChildren->firstWhere('name', $standalone->name);
                    if (!$exists) {
                        $existingChildren->push([
                            'id' => $standalone->id,
                            'name' => $standalone->name,
                            'selected' => false,
                            'is_standalone' => true,
                        ]);
                    }
                }
                $manageBalanceRequests->child_permissions = $existingChildren;
            }
        }

        return $managePermissions;

    }
}
