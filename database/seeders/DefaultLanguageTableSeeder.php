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
            ['name' => 'English', 'iso_code' => 'en', 'is_default' => true, 'status' => true],
            ['name' => 'Chinese', 'iso_code' => 'cn', 'is_default' => false, 'status' => true],
            ['name' => 'French', 'iso_code' => 'fr', 'is_default' => false, 'status' => true],
            ['name' => 'German', 'iso_code' => 'gr', 'is_default' => false, 'status' => true],
            ['name' => 'Spanish', 'iso_code' => 'sp', 'is_default' => false, 'status' => true],
            ['name' => 'Turkish', 'iso_code' => 'tr', 'is_default' => false, 'status' => true],
            ['name' => 'Arabic', 'iso_code' => 'ar', 'is_default' => false, 'status' => true],
            ['name' => 'Vietnamese', 'iso_code' => 'vi', 'is_default' => false, 'status' => true],
            ['name' => 'Indonesian', 'iso_code' => 'id', 'is_default' => false, 'status' => true],
        ];

        foreach ($languages as $lang) {
            if (!Language::where('iso_code', $lang['iso_code'])->exists()) {
                Language::create($lang);
            }
        }
    }
}
