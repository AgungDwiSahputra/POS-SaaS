<?php

namespace Database\Seeders;

use App\Models\Role as ModelsRole;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class SuperAdminPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get SUPER_ADMIN role
        $superAdminRole = Role::where('name', ModelsRole::SUPER_ADMIN)->first();

        if (!$superAdminRole) {
            $this->command->error('SUPER_ADMIN role not found. Please run DefaultUserSeeder first.');
            return;
        }

        // Get all permissions
        $allPermissions = Permission::pluck('name', 'id');

        if ($allPermissions->isEmpty()) {
            $this->command->warn('No permissions found in the database.');
            return;
        }

        // Assign all permissions to SUPER_ADMIN role
        $superAdminRole->givePermissionTo($allPermissions);

        $this->command->info('Successfully assigned ' . $allPermissions->count() . ' permissions to SUPER_ADMIN role.');
        $this->command->info('Permissions assigned: ' . implode(', ', $allPermissions->toArray()));
    }
}
