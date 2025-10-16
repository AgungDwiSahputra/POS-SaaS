<?php

namespace App\Observers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DatabaseQueryObserver
{
    /**
     * Handle the Model "creating" event.
     */
    public function creating(Model $model): void
    {
        $this->logModelEvent($model, 'INSERT');
    }

    /**
     * Handle the Model "created" event.
     */
    public function created(Model $model): void
    {
        $this->logModelEvent($model, 'INSERT_COMPLETED', [
            'model_id' => $model->getKey(),
            'execution_time_ms' => $this->getExecutionTime(),
        ]);
    }

    /**
     * Handle the Model "updating" event.
     */
    public function updating(Model $model): void
    {
        $this->logModelEvent($model, 'UPDATE');
    }

    /**
     * Handle the Model "updated" event.
     */
    public function updated(Model $model): void
    {
        $this->logModelEvent($model, 'UPDATE_COMPLETED', [
            'model_id' => $model->getKey(),
            'execution_time_ms' => $this->getExecutionTime(),
        ]);
    }

    /**
     * Handle the Model "deleting" event.
     */
    public function deleting(Model $model): void
    {
        $this->logModelEvent($model, 'DELETE');
    }

    /**
     * Handle the Model "deleted" event.
     */
    public function deleted(Model $model): void
    {
        $this->logModelEvent($model, 'DELETE_COMPLETED', [
            'model_id' => $model->getKey(),
            'execution_time_ms' => $this->getExecutionTime(),
        ]);
    }

    /**
     * Handle the Model "retrieved" event.
     */
    public function retrieved(Model $model): void
    {
        // Only log if explicitly enabled for SELECT queries
        if (config('database.query_logging.log_selects', false)) {
            $this->logModelEvent($model, 'SELECT', [
                'model_id' => $model->getKey(),
            ]);
        }
    }

    /**
     * Log model events with context
     */
    protected function logModelEvent(Model $model, string $event, array $additionalData = []): void
    {
        $logData = array_merge([
            'type' => 'ELOQUENT_EVENT',
            'event' => $event,
            'model' => get_class($model),
            'table' => $model->getTable(),
            'connection' => $model->getConnectionName(),
            'timestamp' => Carbon::now()->toISOString(),
            'memory_usage_mb' => round(memory_get_usage(true) / 1024 / 1024, 2),
        ], $additionalData);

        // Log based on event type
        switch ($event) {
            case 'INSERT':
            case 'UPDATE':
            case 'DELETE':
                Log::info("Eloquent Model {$event} Started", $logData);
                break;
            case 'INSERT_COMPLETED':
            case 'UPDATE_COMPLETED':
            case 'DELETE_COMPLETED':
                Log::info("Eloquent Model {$event} Completed", $logData);
                break;
            case 'SELECT':
                Log::debug('Eloquent Model Retrieved', $logData);
                break;
        }
    }

    /**
     * Get execution time (placeholder - would need to be implemented with actual timing)
     */
    protected function getExecutionTime(): float
    {
        // This would need to be implemented with actual timing mechanism
        return 0.0;
    }
}