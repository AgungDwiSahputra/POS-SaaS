<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Resources\ManageStockCollection;
use App\Http\Resources\ManageStockResource;
use App\Repositories\ManageStockRepository;
use App\Services\ReportStockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

        return $this->sendResponse($reportData, 'Stock report retrieved successfully');
    }
}
