<?php

namespace Database\Seeders;

use App\Models\CashAdvanceIdentity;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CashAdvanceIdentitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create test cash advance identities if they don't exist
        if (CashAdvanceIdentity::count() == 0) {
            CashAdvanceIdentity::create([
                'name' => 'John Doe',
                'email' => 'john.doe@example.com',
                'phone' => '08123456789',
                'employee_id' => 1,
                'department' => 'IT Department',
                'address' => 'Jakarta, Indonesia',
                'date_of_birth' => '1990-01-01',
                'type' => 'employee',
                'is_active' => true,
                'notes' => 'Test employee for cash advance system',
                'created_by' => 1, // Assuming admin user ID is 1
            ]);

            CashAdvanceIdentity::create([
                'name' => 'Jane Smith',
                'email' => 'jane.smith@example.com',
                'phone' => '08198765432',
                'employee_id' => 2,
                'department' => 'Finance Department',
                'address' => 'Bandung, Indonesia',
                'date_of_birth' => '1985-05-15',
                'type' => 'employee',
                'is_active' => true,
                'notes' => 'Finance staff',
                'created_by' => 1,
            ]);

            CashAdvanceIdentity::create([
                'name' => 'Bob Wilson',
                'email' => 'bob.wilson@example.com',
                'phone' => '08987654321',
                'employee_id' => 3,
                'department' => 'Operations',
                'address' => 'Surabaya, Indonesia',
                'date_of_birth' => '1988-12-10',
                'type' => 'contractor',
                'is_active' => true,
                'notes' => 'External contractor',
                'created_by' => 1,
            ]);
        }
    }
}
