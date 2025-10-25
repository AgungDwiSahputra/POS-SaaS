<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\App;
use Tests\TestCase;

class LanguageSwitchingTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_detect_user_preferred_locale()
    {
        $user = User::factory()->create([
            'preferred_locale' => 'en'
        ]);

        $this->actingAs($user);

        // Test middleware language detection
        $response = $this->get('/app');

        $this->assertEquals('en', App::getLocale());
    }

    /** @test */
    public function it_falls_back_to_default_locale_when_user_has_no_preference()
    {
        $user = User::factory()->create([
            'preferred_locale' => null
        ]);

        $this->actingAs($user);

        $response = $this->get('/app');

        // Should default to 'id' (Indonesian)
        $this->assertEquals('id', App::getLocale());
    }

    /** @test */
    public function it_can_update_user_preferred_locale_via_api()
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/api/user/update-locale', [
            'preferred_locale' => 'en'
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Preferred locale updated successfully'
                 ]);

        $user->refresh();
        $this->assertEquals('en', $user->preferred_locale);
    }

    /** @test */
    public function it_validates_locale_input()
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/api/user/update-locale', [
            'preferred_locale' => 'invalid_locale'
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function it_can_detect_browser_language_preference()
    {
        $response = $this->get('/app', [
            'Accept-Language' => 'en-US,en;q=0.9'
        ]);

        $response->assertStatus(200);
        // The middleware should detect 'en' from Accept-Language header
        $this->assertEquals('en', App::getLocale());
    }
}