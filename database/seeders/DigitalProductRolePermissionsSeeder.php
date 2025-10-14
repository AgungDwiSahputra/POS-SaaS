<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DigitalProductRolePermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Assign digital product permissions to admin role
        $adminRole = Role::where('name', 'admin')->first();

        if ($adminRole) {
            $digitalPermissions = [
                // Digital Provider Permissions
                'manage_digital_providers',
                'create_digital_providers',
                'view_digital_providers',
                'edit_digital_providers',
                'delete_digital_providers',

                // Digital Product Permissions
                'manage_digital_products',
                'create_digital_products',
                'view_digital_products',
                'edit_digital_products',
                'delete_digital_products',

                // Digital Sales Permissions
                'manage_digital_sales',
                'create_digital_sales',
                'view_digital_sales',
                'edit_digital_sales',
                'delete_digital_sales',

                // Digital Topup Permissions
                'manage_digital_topup',
                'create_digital_topup',
                'approve_digital_topup',
                'view_digital_topup',

                // Digital Withdrawal Permissions
                'manage_digital_withdrawal',
                'create_digital_withdrawal',
                'view_digital_withdrawal',
                'edit_digital_withdrawal',
                'delete_digital_withdrawal',
            ];

            foreach ($digitalPermissions as $permissionName) {
                $permission = Permission::where('name', $permissionName)->first();
                if ($permission) {
                    $adminRole->givePermissionTo($permission);
                }
            }
        }

        // Assign digital product permissions to superadmin role
        $superAdminRole = Role::where('name', 'superadmin')->first();

        if ($superAdminRole) {
            $digitalPermissions = [
                // Digital Provider Permissions
                'manage_digital_providers',
                'create_digital_providers',
                'view_digital_providers',
                'edit_digital_providers',
                'delete_digital_providers',

                // Digital Product Permissions
                'manage_digital_products',
                'create_digital_products',
                'view_digital_products',
                'edit_digital_products',
                'delete_digital_products',

                // Digital Sales Permissions
                'manage_digital_sales',
                'create_digital_sales',
                'view_digital_sales',
                'edit_digital_sales',
                'delete_digital_sales',

                // Digital Topup Permissions
                'manage_digital_topup',
                'create_digital_topup',
                'approve_digital_topup',
                'view_digital_topup',

                // Digital Withdrawal Permissions
                'manage_digital_withdrawal',
                'create_digital_withdrawal',
                'view_digital_withdrawal',
                'edit_digital_withdrawal',
                'delete_digital_withdrawal',
            ];

            foreach ($digitalPermissions as $permissionName) {
                $permission = Permission::where('name', $permissionName)->first();
                if ($permission) {
                    $superAdminRole->givePermissionTo($permission);
                }
            }
        }
    }
}