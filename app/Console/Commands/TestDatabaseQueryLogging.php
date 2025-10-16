<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\CashAdvanceIdentity;

class TestDatabaseQueryLogging extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'db:test-query-logging
                            {--simple : Run simple queries only}
                            {--complex : Run complex queries with relationships}
                            {--all : Run both simple and complex queries}';

    /**
     * The console command description.
     */
    protected $description = 'Test database query logging with various query types';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🧪 Testing Database Query Logging...');
        $this->newLine();

        if ($this->option('simple') || $this->option('all')) {
            $this->testSimpleQueries();
        }

        if ($this->option('complex') || $this->option('all')) {
            $this->testComplexQueries();
        }

        if (!$this->option('simple') && !$this->option('complex') && !$this->option('all')) {
            $this->testSimpleQueries();
        }

        $this->newLine();
        $this->info('✅ Query logging test completed!');
        $this->info('📋 Check your logs at: storage/logs/laravel.log');
    }

    /**
     * Test simple database queries
     */
    protected function testSimpleQueries(): void
    {
        $this->info('📝 Testing Simple Queries...');
        $this->newLine();

        // SELECT query
        $this->info('1. Testing SELECT query...');
        $users = DB::table('users')->limit(5)->get();
        $this->line("   Found {$users->count()} users");

        // INSERT query
        $this->info('2. Testing INSERT query...');
        $insertId = DB::table('users')->insertGetId([
            'name' => 'Test User ' . now()->timestamp,
            'email' => 'test' . now()->timestamp . '@example.com',
            'password' => bcrypt('password'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $this->line("   Inserted user with ID: {$insertId}");

        // UPDATE query
        $this->info('3. Testing UPDATE query...');
        $updated = DB::table('users')
            ->where('id', $insertId)
            ->update(['name' => 'Updated Test User ' . now()->timestamp]);
        $this->line("   Updated {$updated} user(s)");

        // DELETE query
        $this->info('4. Testing DELETE query...');
        $deleted = DB::table('users')->where('id', $insertId)->delete();
        $this->line("   Deleted {$deleted} user(s)");

        $this->newLine();
    }

    /**
     * Test complex database queries with relationships
     */
    protected function testComplexQueries(): void
    {
        $this->info('🔗 Testing Complex Queries with Relationships...');
        $this->newLine();

        // Eloquent query with relationships
        $this->info('1. Testing Eloquent query with relationships...');
        if (class_exists(CashAdvanceIdentity::class)) {
            $identities = CashAdvanceIdentity::with(['cashAdvances' => function ($query) {
                $query->with('payments')->limit(2);
            }])->limit(3)->get();
            $this->line("   Found {$identities->count()} identities with relationships");
        } else {
            $this->warn('   CashAdvanceIdentity model not found, skipping...');
        }

        // Complex JOIN query
        $this->info('2. Testing complex JOIN query...');
        $results = DB::table('users')
            ->join('cash_advance_identities', 'users.id', '=', 'cash_advance_identities.created_by')
            ->select('users.name', 'cash_advance_identities.name as identity_name')
            ->limit(5)
            ->get();
        $this->line("   Found {$results->count()} joined records");

        // Subquery
        $this->info('3. Testing subquery...');
        $subqueryResults = DB::table('users')
            ->whereIn('id', function ($query) {
                $query->select('created_by')
                      ->from('cash_advance_identities')
                      ->limit(5);
            })
            ->get();
        $this->line("   Found {$subqueryResults->count()} users from subquery");

        // Raw query with parameters
        $this->info('4. Testing raw query with parameters...');
        $rawResults = DB::select(
            'SELECT * FROM users WHERE created_at > ? LIMIT ?',
            [now()->subDays(30)->toDateTimeString(), 3]
        );
        $this->line("   Found " . count($rawResults) . " users from raw query");

        $this->newLine();
    }
}