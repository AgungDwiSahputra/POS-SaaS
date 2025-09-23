<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Cash Advances Data Cleanup ===\n\n";

try {
    // Get all valid identity IDs
    $validIdentityIds = DB::table('cash_advance_identities')->pluck('id')->toArray();
    
    echo "Valid Identity IDs: " . implode(', ', $validIdentityIds) . "\n\n";
    
    if (empty($validIdentityIds)) {
        echo "No identities found. Deleting all cash advances...\n";
        $deletedCount = DB::table('cash_advances')->delete();
        echo "Deleted {$deletedCount} cash advances\n";
    } else {
        // Find and delete invalid cash advances
        $invalidCashAdvances = DB::table('cash_advances')
            ->whereNotIn('identity_id', $validIdentityIds)
            ->whereNotNull('identity_id')
            ->get();
        
        if ($invalidCashAdvances->count() > 0) {
            echo "Found {$invalidCashAdvances->count()} invalid cash advances\n";
            echo "Invalid identity_id values: " . implode(', ', $invalidCashAdvances->pluck('identity_id')->toArray()) . "\n";
            
            $deletedCount = DB::table('cash_advances')
                ->whereNotIn('identity_id', $validIdentityIds)
                ->whereNotNull('identity_id')
                ->delete();
            
            echo "Deleted {$deletedCount} invalid cash advances\n";
        }
        
        // Handle NULL identity_id values
        $nullIdentityCount = DB::table('cash_advances')->whereNull('identity_id')->count();
        
        if ($nullIdentityCount > 0) {
            echo "Found {$nullIdentityCount} cash advances with NULL identity_id\n";
            
            $defaultIdentityId = $validIdentityIds[0];
            $updatedCount = DB::table('cash_advances')
                ->whereNull('identity_id')
                ->update(['identity_id' => $defaultIdentityId]);
            
            echo "Updated {$updatedCount} cash advances with NULL identity_id to default identity {$defaultIdentityId}\n";
        }
        
        // Final verification
        $remainingInvalid = DB::table('cash_advances')
            ->whereNotIn('identity_id', $validIdentityIds)
            ->whereNotNull('identity_id')
            ->count();
        
        if ($remainingInvalid > 0) {
            echo "ERROR: Still found {$remainingInvalid} invalid cash advances after cleanup\n";
        } else {
            echo "SUCCESS: All cash advances now have valid identity_id\n";
        }
    }
    
    // Show final counts
    $finalCashAdvancesCount = DB::table('cash_advances')->count();
    $finalIdentitiesCount = DB::table('cash_advance_identities')->count();
    
    echo "\nFinal counts:\n";
    echo "Cash Advances: {$finalCashAdvancesCount}\n";
    echo "Identities: {$finalIdentitiesCount}\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== Cleanup Complete ===\n";
