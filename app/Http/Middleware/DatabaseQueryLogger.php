<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class DatabaseQueryLogger
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Enable query logging for this request
        $shouldLog = $this->shouldLogQueries($request);

        if ($shouldLog) {
            DB::enableQueryLog();
            $startTime = microtime(true);

            Log::info('Database Query Logging Started', [
                'request_id' => $request->header('X-Request-ID', uniqid()),
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        $response = $next($request);

        if ($shouldLog) {
            $endTime = microtime(true);
            $totalTime = ($endTime - $startTime) * 1000; // Convert to milliseconds

            $queryLog = DB::getQueryLog();
            $queryCount = count($queryLog);
            $totalQueryTime = $this->calculateTotalQueryTime();

            // Only log if there were errors, slow queries, or if explicitly requested
            $hasImportantEvents = $this->hasImportantEvents($queryLog);

            if ($hasImportantEvents || $request->has('debug') && $request->get('debug') === 'queries') {
                Log::info('Database Query Logging Completed (Selective)', [
                    'request_id' => $request->header('X-Request-ID', uniqid()),
                    'total_queries' => $queryCount,
                    'logged_queries' => count(array_filter($queryLog, fn($q) => isset($q['logged']))),
                    'total_query_time_ms' => round($totalQueryTime, 2),
                    'total_request_time_ms' => round($totalTime, 2),
                    'query_efficiency' => $queryCount > 0 ? round(($totalQueryTime / $totalTime) * 100, 2) : 0,
                    'important_events' => $hasImportantEvents,
                ]);
            }
        }

        return $response;
    }

    /**
     * Determine if queries should be logged for this request
     */
    protected function shouldLogQueries(Request $request): bool
    {
        // Don't log API calls unless explicitly enabled
        if ($request->is('api/*') && !config('database.query_logging.api_enabled', false)) {
            return false;
        }

        // Don't log health check endpoints
        if ($request->is('health') || $request->is('status')) {
            return false;
        }

        // Log based on configuration or request parameter
        return config('database.query_logging.enabled', false) ||
               $request->has('debug') && $request->get('debug') === 'queries';
    }

    /**
     * Calculate total query execution time
     */
    protected function calculateTotalQueryTime(): float
    {
        $queryLog = DB::getQueryLog();
        $totalTime = 0;

        foreach ($queryLog as $query) {
            $totalTime += $query['time'] ?? 0;
        }

        return $totalTime;
    }

    /**
     * Check if there are important events (errors, slow queries) in the query log
     */
    protected function hasImportantEvents(array $queryLog): bool
    {
        $slowQueryThreshold = config('database.query_logging.slow_query_threshold', 1000);

        foreach ($queryLog as $query) {
            $executionTime = $query['time'] ?? 0;

            // Check for slow queries
            if ($executionTime > $slowQueryThreshold) {
                return true;
            }

            // Check for error indicators in SQL
            $sql = $query['sql'] ?? '';
            $errorPatterns = [
                '/deadlock/i',
                '/lock wait timeout/i',
                '/constraint violation/i',
                '/duplicate entry/i',
                '/foreign key constraint/i',
            ];

            foreach ($errorPatterns as $pattern) {
                if (preg_match($pattern, $sql)) {
                    return true;
                }
            }
        }

        return false;
    }
}