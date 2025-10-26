<?php

namespace App\Exports;

use App\Models\ManageStock;
use Maatwebsite\Excel\Concerns\FromView;

class StockReportExport implements FromView
{
    public function view(): \Illuminate\Contracts\View\View
    {
        $warehouseId = request()->get('warehouse_id');

        // Validate warehouse ID
        if (!$warehouseId) {
            throw new \InvalidArgumentException('Warehouse ID is required for stock report export');
        }

        try {
            $stocks = ManageStock::whereWarehouseId($warehouseId)
                ->with('product', 'warehouse')
                ->get();

            // Check if stocks exist
            if ($stocks->isEmpty()) {
                // Return empty view with message or handle accordingly
                return view('excel.stock-report-excel', ['stocks' => collect([])]);
            }

            return view('excel.stock-report-excel', ['stocks' => $stocks]);
        } catch (\Exception $e) {
            // Log the error
            \Log::error('Error exporting stock report: ' . $e->getMessage());
            
            // Re-throw or handle as needed
            throw new \Exception('Failed to export stock report: ' . $e->getMessage());
        }
    }
}
