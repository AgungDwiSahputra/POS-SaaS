<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Resources\ManageStockCollection;
use App\Http\Resources\ManageStockResource;
use App\Repositories\ManageStockRepository;
use App\Services\ReportStockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Class ManageStockAPIController
 */
class ManageStockAPIController extends AppBaseController
{
    private $manageStockRepository;
    private $reportStockService;

    public function __construct(
        ManageStockRepository $manageStockRepository,
        ReportStockService $reportStockService
    ) {
        $this->manageStockRepository = $manageStockRepository;
        $this->reportStockService = $reportStockService;
    }

    public function stockReport(Request $request): JsonResponse
    {
        $filters = [
            'category_id' => $request->get('category_id'),
            'warehouse_id' => $request->get('warehouse_id'),
            'supplier_id' => $request->get('supplier_id'),
            'q' => $request->get('search'),
            'start' => $request->get('start_date'),
            'end' => $request->get('end_date'),
            'per_page' => getPageSize($request),
        ];

        $reportData = $this->reportStockService->getReport($filters);

        // Debug logging untuk memeriksa data sebelum response
        $items = $reportData['data']['data'] ?? [];
        Log::info('Stock Report API Debug', [
            'total_items' => count($items),
            'first_item' => !empty($items) ? [
                'id' => $items[0]['id'] ?? 'N/A',
                'name' => $items[0]['name'] ?? 'N/A',
                'product_cost' => $items[0]['product_cost'] ?? 'MISSING',
                'hpp' => $items[0]['hpp'] ?? 'MISSING',
                'cost' => $items[0]['cost'] ?? 'MISSING',
                'product_cost_type' => gettype($items[0]['product_cost'] ?? null),
                'hpp_type' => gettype($items[0]['hpp'] ?? null),
                'cost_type' => gettype($items[0]['cost'] ?? null),
            ] : 'no items',
            'raw_data_sample' => !empty($items) ? array_slice($items, 0, 1) : 'no data'
        ]);

        return $this->sendResponse($reportData, 'Stock report retrieved successfully');
    }
}
