<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Cash Advances Data Debug ===\n\n";

try {
    // Check cash advances count
    $cashAdvancesCount = DB::table('cash_advances')->count();
    echo "Total Cash Advances: {$cashAdvancesCount}\n";
    
    // Check identities count
    $identitiesCount = DB::table('cash_advance_identities')->count();
    echo "Total Cash Advance Identities: {$identitiesCount}\n\n";
    
    if ($identitiesCount > 0) {
        // Get valid identity IDs
        $validIdentityIds = DB::table('cash_advance_identities')->pluck('id')->toArray();
        echo "Valid Identity IDs: " . implode(', ', $validIdentityIds) . "\n\n";
        
        // Check for invalid identity_id in cash_advances
        $invalidCashAdvances = DB::table('cash_advances')
            ->whereNotIn('identity_id', $validIdentityIds)
            ->whereNotNull('identity_id')
            ->get();
        
        echo "Invalid Cash Advances (identity_id not in identities): {$invalidCashAdvances->count()}\n";
        
        if ($invalidCashAdvances->count() > 0) {
            echo "Invalid identity_id values: " . implode(', ', $invalidCashAdvances->pluck('identity_id')->toArray()) . "\n";
            echo "Details:\n";
            foreach ($invalidCashAdvances as $ca) {
                echo "  - ID: {$ca->id}, Identity ID: {$ca->identity_id}, Amount: {$ca->amount}\n";
            }
        }
        
        // Check for NULL identity_id
        $nullIdentityCount = DB::table('cash_advances')->whereNull('identity_id')->count();
        echo "\nCash Advances with NULL identity_id: {$nullIdentityCount}\n";
        
        if ($nullIdentityCount > 0) {
            $nullCashAdvances = DB::table('cash_advances')->whereNull('identity_id')->get();
            echo "Details:\n";
            foreach ($nullCashAdvances as $ca) {
                echo "  - ID: {$ca->id}, Amount: {$ca->amount}\n";
            }
        }
        
    } else {
        echo "No identities found! This will cause foreign key constraint issues.\n";
    }
    
    echo "\n=== Data Cleanup Recommendations ===\n";
    
    if ($identitiesCount == 0) {
        echo "1. Create at least one Cash Advance Identity first\n";
        echo "2. Or delete all cash advances if they're not needed\n";
    } else {
        if ($invalidCashAdvances->count() > 0) {
            echo "1. Delete invalid cash advances with identity_id not in identities\n";
            echo "2. Or update them to use valid identity_id\n";
        }
        
        if ($nullIdentityCount > 0) {
            echo "3. Update NULL identity_id to a valid identity\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== End Debug ===\n";
