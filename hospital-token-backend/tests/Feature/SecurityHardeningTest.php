<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Hospital;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityHardeningTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(\Illuminate\Routing\Middleware\ThrottleRequests::class);
    }

    public function test_patient_login_succeeds_without_password_or_with_valid_password(): void
    {
        $user = User::create([
            'crno' => '2100001',
            'name' => 'John Doe',
            'password' => 'secret123',
        ]);

        // Attempt login without password
        $response = $this->postJson('/api/user/login', [
            'crno' => '2100001',
        ]);
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'token',
                'user',
            ]
        ]);

        // Attempt login with wrong password
        $response = $this->postJson('/api/user/login', [
            'crno' => '2100001',
            'password' => 'wrongpassword',
        ]);
        $response->assertStatus(401);

        // Attempt login with correct password
        $response = $this->postJson('/api/user/login', [
            'crno' => '2100001',
            'password' => 'secret123',
        ]);
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'token',
                'user',
            ]
        ]);
    }

    public function test_check_role_middleware_blocks_unauthorized_access(): void
    {
        $patient = User::create([
            'crno' => '2100002',
            'name' => 'Jane Smith',
            'password' => 'secret123',
        ]);

        // Authenticate as patient
        $this->actingAs($patient, 'sanctum');

        // Access patient route - should succeed
        $response = $this->getJson('/api/booking/my-bookings');
        $response->assertStatus(200);

        // Access admin route - should be forbidden by role:admin
        $response = $this->getJson('/api/hospital/dashboard/summary');
        $response->assertStatus(403);
    }
}
