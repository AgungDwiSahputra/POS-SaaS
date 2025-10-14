<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class DigitalProductPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // Digital Provider Permissions
            ['name' => 'manage_digital_providers', 'display_name' => 'Manage Digital Providers'],
            ['name' => 'create_digital_providers', 'display_name' => 'Create Digital Providers'],
            ['name' => 'view_digital_providers', 'display_name' => 'View Digital Providers'],
            ['name' => 'edit_digital_providers', 'display_name' => 'Edit Digital Providers'],
            ['name' => 'delete_digital_providers', 'display_name' => 'Delete Digital Providers'],

            // Digital Product Permissions
            ['name' => 'manage_digital_products', 'display_name' => 'Manage Digital Products'],
            ['name' => 'create_digital_products', 'display_name' => 'Create Digital Products'],
            ['name' => 'view_digital_products', 'display_name' => 'View Digital Products'],
            ['name' => 'edit_digital_products', 'display_name' => 'Edit Digital Products'],
            ['name' => 'delete_digital_products', 'display_name' => 'Delete Digital Products'],

            // Digital Sales Permissions
            ['name' => 'manage_digital_sales', 'display_name' => 'Manage Digital Sales'],
            ['name' => 'create_digital_sales', 'display_name' => 'Create Digital Sales'],
            ['name' => 'view_digital_sales', 'display_name' => 'View Digital Sales'],
            ['name' => 'edit_digital_sales', 'display_name' => 'Edit Digital Sales'],
            ['name' => 'delete_digital_sales', 'display_name' => 'Delete Digital Sales'],

            // Digital Topup Permissions
            ['name' => 'manage_digital_topup', 'display_name' => 'Manage Digital Topup'],
            ['name' => 'create_digital_topup', 'display_name' => 'Create Digital Topup'],
            ['name' => 'approve_digital_topup', 'display_name' => 'Approve Digital Topup'],
            ['name' => 'view_digital_topup', 'display_name' => 'View Digital Topup'],

            // Digital Withdrawal Permissions
            ['name' => 'manage_digital_withdrawal', 'display_name' => 'Manage Digital Withdrawal'],
            ['name' => 'create_digital_withdrawal', 'display_name' => 'Create Digital Withdrawal'],
            ['name' => 'view_digital_withdrawal', 'display_name' => 'View Digital Withdrawal'],
            ['name' => 'edit_digital_withdrawal', 'display_name' => 'Edit Digital Withdrawal'],
            ['name' => 'delete_digital_withdrawal', 'display_name' => 'Delete Digital Withdrawal'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission['name']],
                [
                    'display_name' => $permission['display_name'],
                    'guard_name' => 'web'
                ]
            );
        }
    }
}
