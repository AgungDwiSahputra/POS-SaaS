<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Database\Events\StatementPrepared;
use Illuminate\Support\Facades\Event;
use Carbon\Carbon;

class DatabaseQueryLoggerProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $this->registerQueryLogging();
    }

    /**
     * Register database query logging
     */
    protected function registerQueryLogging(): void
    {
        // Only enable in non-production environments or when explicitly enabled
        if (!$this->shouldEnableQueryLogging()) {
            return;
        }

        DB::enableQueryLog();

        // Listen for query execution events
        Event::listen(QueryExecuted::class, function (QueryExecuted $query) {
            $this->logQuery($query);
        });

        // Listen for statement prepared events (for parameter logging)
        Event::listen(StatementPrepared::class, function (StatementPrepared $statement) {
            $this->logStatement($statement);
        });
    }

    /**
     * Determine if query logging should be enabled
     */
    protected function shouldEnableQueryLogging(): bool
    {
        // Enable in local environment or when explicitly configured
        return app()->environment(['local', 'development', 'testing']) ||
               config('database.query_logging.enabled', false);
    }

    /**
     * Log the executed query (SELECTIVE LOGGING)
     */
    protected function logQuery(QueryExecuted $query): void
    {
        $sql = $query->sql;
        $bindings = $query->bindings;
        $time = $query->time;
        $connectionName = $query->connectionName;

        // Replace bindings in SQL for readable format
        $readableSql = $this->replaceBindingsInSql($sql, $bindings);

        $logData = [
            'connection' => $connectionName,
            'sql' => $readableSql,
            'bindings' => $bindings,
            'execution_time_ms' => round($time, 2),
            'timestamp' => Carbon::now()->toISOString(),
            'memory_usage' => $this->getMemoryUsage(),
        ];

        // Only log errors, failures, or slow queries (selective logging)
        $slowQueryThreshold = config('database.query_logging.slow_query_threshold', 1000);
        $logErrors = config('database.query_logging.log_errors', true);
        $logSlowQueries = config('database.query_logging.log_slow_queries', true);

        // Check for potential errors in query (basic heuristics)
        $isErrorQuery = $this->isErrorQuery($sql, $time);

        // Determine log level and message based on conditions
        if ($isErrorQuery && $logErrors) {
            $logData['type'] = 'QUERY_ERROR';
            $logData['error_type'] = $this->detectErrorType($sql, $time);
            Log::error('Database Query Error/Failure Detected', $logData);
        } elseif ($time > $slowQueryThreshold && $logSlowQueries) {
            $logData['type'] = 'SLOW_QUERY';
            Log::warning('Slow Database Query Detected', $logData);
        }
        // Note: Successful routine queries are NOT logged to reduce noise
    }

    /**
     * Log statement preparation
     */
    protected function logStatement(StatementPrepared $event): void
    {
        $statement = $event->statement;
        $connectionName = $event->connection->getName();

        // Get the SQL query from the PDOStatement
        $sqlQuery = $statement->queryString ?? 'N/A';

        $logData = [
            'type' => 'STATEMENT_PREPARED',
            'connection' => $connectionName,
            'statement_preview' => strlen($sqlQuery) > 100 ? substr($sqlQuery, 0, 100) . '...' : $sqlQuery,
            'statement_hash' => hash('sha256', $sqlQuery),
            'timestamp' => Carbon::now()->toISOString(),
        ];

        // Log::debug('Database Statement Prepared', $logData);
    }

    /**
     * Replace parameter bindings in SQL query for readability
     */
    protected function replaceBindingsInSql(string $sql, array $bindings): string
    {
        $bindings = array_map(function ($binding) {
            if (is_string($binding)) {
                return "'" . addslashes($binding) . "'";
            } elseif (is_null($binding)) {
                return 'NULL';
            } elseif (is_bool($binding)) {
                return $binding ? 'true' : 'false';
            } else {
                return $binding;
            }
        }, $bindings);

        // Escape % characters to prevent vsprintf errors
        $readableSql = str_replace('%', '%%', $sql);

        // Replace ? placeholders with actual values
        $readableSql = str_replace('?', '%s', $readableSql);

        return vsprintf($readableSql, $bindings);
    }

    /**
     * Get current memory usage
     */
    protected function getMemoryUsage(): array
    {
        return [
            'current_mb' => round(memory_get_usage(true) / 1024 / 1024, 2),
            'peak_mb' => round(memory_get_peak_usage(true) / 1024 / 1024, 2),
        ];
    }

    /**
     * Detect if a query indicates an error condition
     */
    protected function isErrorQuery(string $sql, float $executionTime): bool
    {
        // Extremely long execution time might indicate a problem
        if ($executionTime > config('database.query_logging.error_threshold', 5000)) {
            return true;
        }

        // Check for potentially problematic query patterns
        $errorPatterns = [
            '/deadlock/i',
            '/lock wait timeout/i',
            '/connection timeout/i',
            '/syntax error/i',
            '/constraint violation/i',
            '/duplicate entry/i',
            '/foreign key constraint/i',
        ];

        foreach ($errorPatterns as $pattern) {
            if (preg_match($pattern, $sql)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Detect the type of error based on query analysis
     */
    protected function detectErrorType(string $sql, float $executionTime): string
    {
        if ($executionTime > config('database.query_logging.error_threshold', 5000)) {
            return 'PERFORMANCE_ISSUE';
        }

        if (preg_match('/constraint violation/i', $sql)) {
            return 'CONSTRAINT_VIOLATION';
        }

        if (preg_match('/foreign key constraint/i', $sql)) {
            return 'FOREIGN_KEY_ERROR';
        }

        if (preg_match('/duplicate entry/i', $sql)) {
            return 'DUPLICATE_ENTRY';
        }

        if (preg_match('/deadlock/i', $sql)) {
            return 'DEADLOCK';
        }

        if (preg_match('/lock wait timeout/i', $sql)) {
            return 'LOCK_TIMEOUT';
        }

        if (preg_match('/syntax error/i', $sql)) {
            return 'SYNTAX_ERROR';
        }

        return 'UNKNOWN_ERROR';
    }
}