<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Resources\ManageStockCollection;
use App\Http\Resources\ManageStockResource;
use App\Repositories\ManageStockRepository;
use Illuminate\Http\Request;

/**
 * Class UserAPIController
 */
class ManageStockAPIController extends AppBaseController
{
    private $manageStockRepository;

    public function __construct(ManageStockRepository $manageStockRepository)
    {
        $this->manageStockRepository = $manageStockRepository;
    }

    public function stockReport(Request $request): ManageStockCollection
    {
        $request->request->remove('filter');
        $perPage = getPageSize($request);
        $search = $request->get('search');
        $warehouseId = $request->get('warehouse_id');
        
        if ($search && $search != 'null') {
            $stocks = $this->manageStockRepository->whereHas('product.productCategory',
                function ($query) use ($search) {
                    $query->where('products.code', 'like', '%'.$search.'%')
                        ->orWhere('products.name', 'like', '%'.$search.'%')
                        ->orWhere('products.product_cost', 'like', '%'.$search.'%')
                        ->orWhere('products.product_price', 'like', '%'.$search.'%')
                        ->orWhere('products.product_price', 'like', '%'.$search.'%')
                        ->orWhere('product_categories.name', 'like', '%'.$search.'%');
                })->where('warehouse_id', $warehouseId)->paginate($perPage);
        } else {
            $stocks = $this->manageStockRepository->where('warehouse_id', $warehouseId)->paginate($perPage);
        }
        
        // Hitung Total Aset keseluruhan untuk semua produk di warehouse ini
        $totalAssetQuery = $this->manageStockRepository->with('product')->where('warehouse_id', $warehouseId);
        
        if ($search && $search != 'null') {
            $totalAssetQuery->whereHas('product.productCategory',
                function ($query) use ($search) {
                    $query->where('products.code', 'like', '%'.$search.'%')
                        ->orWhere('products.name', 'like', '%'.$search.'%')
                        ->orWhere('products.product_cost', 'like', '%'.$search.'%')
                        ->orWhere('products.product_price', 'like', '%'.$search.'%')
                        ->orWhere('products.product_price', 'like', '%'.$search.'%')
                        ->orWhere('product_categories.name', 'like', '%'.$search.'%');
                });
        }
        
        $allStocks = $totalAssetQuery->get();
        $totalAsset = $allStocks->sum(function ($stock) {
            return $stock->quantity * $stock->product->product_cost;
        });
        
        ManageStockResource::usingWithCollection();

        return (new ManageStockCollection($stocks))->additional([
            'total_asset' => $totalAsset,
            'total_products' => $allStocks->count(),
            'total_quantity' => $allStocks->sum('quantity')
        ]);
    }
}
