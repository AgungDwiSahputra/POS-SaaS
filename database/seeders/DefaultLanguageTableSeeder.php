<?php

namespace Database\Seeders;

use App\Models\Language;
use Illuminate\Database\Seeder;

class DefaultLanguageTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $languages = [
            ['name' => 'Indonesian', 'iso_code' => 'id', 'is_default' => true, 'status' => true],
            ['name' => 'English', 'iso_code' => 'en', 'is_default' => false, 'status' => true],
        ];

        foreach ($languages as $lang) {
            if (!Language::where('iso_code', $lang['iso_code'])->exists()) {
                Language::create($lang);
            }
        }
    }
}
