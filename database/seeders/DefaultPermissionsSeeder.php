<?php

namespace Database\Seeders;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use App\Models\Role as RoleModel;

class DefaultPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions  = [
            [
                'name' => 'manage_adjustments',
                'display_name' => 'Manage Adjustments'
            ],
            [
                'name' => 'manage_transfers',
                'display_name' => 'Manage Transfers'
            ],
            [
                'name' => 'manage_roles',
                'display_name' => 'Manage Roles'
            ],
            [
                'name' => 'manage_brands',
                'display_name' => 'Manage Brands'
            ],
            [
                'name' => 'manage_warehouses',
                'display_name' => 'Manage Warehouses'
            ],
            [
                'name' => 'manage_units',
                'display_name' => 'Manage Units'
            ],
            [
                'name' => 'manage_product_categories',
                'display_name' => 'Manage Product Categories'
            ],
            [
                'name' => 'manage_products',
                'display_name' => 'Manage Products '
            ],
            [
                'name' => 'manage_suppliers',
                'display_name' => 'Manage Suppliers'
            ],
            [
                'name' => 'manage_customers',
                'display_name' => 'Manage Customers'
            ],
            [
                'name' => 'manage_users',
                'display_name' => 'Manage Users'
            ],
            [
                'name' => 'manage_expense_categories',
                'display_name' => 'Manage Expense Categories'
            ],
            [
                'name' => 'manage_expenses',
                'display_name' => 'Manage Expenses'
            ],
            [
                'name' => 'manage_cash_advances',
                'display_name' => __('cash_advance.permission.manage')
            ],
            [
                'name' => 'manage_setting',
                'display_name' => 'Manage Setting'
            ],
            [
                'name' => 'manage_dashboard',
                'display_name' => 'Manage Dashboard'
            ],
            [
                'name' => 'manage_pos_screen',
                'display_name' => 'Manage Pos Screen'
            ],
            [
                'name' => 'manage_purchase',
                'display_name' => 'Manage Purchase'
            ],
            [
                'name' => 'manage_sale',
                'display_name' => 'Manage Sale'
            ],
            [
                'name' => 'manage_purchase_return',
                'display_name' => 'Manage Purchase Return'
            ],
            [
                'name' => 'manage_sale_return',
                'display_name' => 'Manage Sale Return'
            ],
            [
                'name' => 'manage_product_digitals',
                'display_name' => 'Manage Product Digitals'
            ],
            [
                'name' => 'manage_digital_sales',
                'display_name' => 'Manage Digital Sales'
            ],
            [
                'name' => 'manage_email_templates',
                'display_name' => 'Manage Email Templates'
            ],
            [
                'name' => 'manage_reports',
                'display_name' => 'Manage Reports'
            ],
            [
                'name' => 'manage_quotations',
                'display_name' => 'Manage Quotations'
            ],
            [
                'name' => 'manage_sms_templates',
                'display_name' => 'Manage Sms Templates'
            ],
            [
                'name' => 'manage_sms_apis',
                'display_name' => 'Manage Sms Apis'
            ],
            [
                'name' => 'manage_variations',
                'display_name' => 'Manage Variations'
            ],
            [
                'name' => 'manage_providers',
                'display_name' => 'Manage Providers'
            ],
            [
                'name' => 'manage_balance_requests',
                'display_name' => 'Manage Balance Requests'
            ],
            [
                'name' => 'create_balance_requests',
                'display_name' => 'Create Balance Requests'
            ],
            [
                'name' => 'delete_balance_requests',
                'display_name' => 'Delete Balance Requests'
            ],
            [
                'name' => 'manage_print_barcode',
                'display_name' => 'Manage Print Barcode'
            ],
            [
                'name' => 'manage_store',
                'display_name' => 'Manage Store'
            ],
        ];

        foreach ($permissions as $permission) {
            $existingPermission = Permission::whereName($permission['name'])->first();

            if (!$existingPermission) {
                try {
                    Permission::create($permission);
                    $this->command->info("Created permission: {$permission['name']}");
                } catch (\Spatie\Permission\Exceptions\PermissionAlreadyExists $e) {
                    $this->command->line("Skipped permission: {$permission['name']} (already exists)", 'fg=gray');
                }
            } else {
                // Update display_name jika berbeda
                if ($existingPermission->display_name !== $permission['display_name']) {
                    $existingPermission->display_name = $permission['display_name'];
                    $existingPermission->save();
                    $this->command->info("Updated permission: {$permission['name']}");
                } else {
                    $this->command->line("Skipped permission: {$permission['name']} (already exists)", 'fg=gray');
                }
            }
        }


        // Hapus permission yang tidak ada dalam daftar
        $definedPermissions = array_column($permissions, 'name');
        $allPermissions = Permission::pluck('name')->toArray();
        $permissionsToDelete = array_diff($allPermissions, $definedPermissions);

        foreach ($permissionsToDelete as $permName) {
            $permission = Permission::where('name', $permName)->first();
            if ($permission) {
                DB::table('role_has_permissions')->where('permission_id', $permission->id)->delete();
                $permission->delete();
                $this->command->info("Deleted permission: {$permName}");
            }
        }
        $adminRole = RoleModel::whereName(RoleModel::ADMIN)->first();
        if ($adminRole) {
            $allPermissionNames = Permission::pluck('name')->toArray();
            $adminRole->syncPermissions($allPermissionNames);
        }

        // $superAdminRole = RoleModel::whereName(RoleModel::SUPER_ADMIN)->first();
        // if ($superAdminRole) {
        //     $allPermissionNames = Permission::pluck('name')->toArray();
        //     $superAdminRole->syncPermissions($allPermissionNames);
        // }
    }
}
