<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class SetDefaultUserPreferredLocaleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Set default preferred_locale for existing users who don't have it set
        // Default to 'id' (Indonesian) for existing users
        User::whereNull('preferred_locale')
            ->orWhere('preferred_locale', '')
            ->update(['preferred_locale' => 'id']);

        $this->command->info('Default preferred_locale set for existing users');
    }
}
