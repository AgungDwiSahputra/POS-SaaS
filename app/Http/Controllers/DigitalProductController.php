<?php

namespace App\Http\Controllers;

use App\Models\DigitalProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class DigitalProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $category = $request->get('category');
        $isActive = $request->get('is_active');

        $query = DigitalProduct::where('tenant_id', Auth::user()->tenant_id);

        if ($category) {
            $query->where('category', $category);
        }

        if ($isActive !== null) {
            $query->where('is_active', $isActive === 'true');
        }

        $digitalProducts = $query->orderBy('sort_order')->paginate(10);

        return response()->json([
            'data' => $digitalProducts->items(),
            'total' => $digitalProducts->total(),
            'per_page' => $digitalProducts->perPage(),
            'current_page' => $digitalProducts->currentPage(),
            'last_page' => $digitalProducts->lastPage(),
            'message' => 'Digital products retrieved successfully',
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), DigitalProduct::rules());

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $digitalProduct = DigitalProduct::create([
            'tenant_id' => Auth::user()->tenant_id,
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'product_code' => $request->product_code,
            'description' => $request->description,
            'category' => $request->category,
            'cost_price' => $request->cost_price,
            'sell_price' => $request->sell_price,
            'provider_code' => $request->provider_code,
            'product_data' => $request->product_data,
            'is_active' => $request->is_active ?? true,
            'sort_order' => $request->sort_order ?? 0,
        ]);

        return response()->json([
            'data' => $digitalProduct->prepareAttributes(),
            'message' => 'Digital product created successfully',
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $digitalProduct = DigitalProduct::where('tenant_id', Auth::user()->tenant_id)
                                       ->find($id);

        if (!$digitalProduct) {
            return response()->json([
                'message' => 'Digital product not found',
            ], 404);
        }

        return response()->json([
            'data' => $digitalProduct->prepareAttributes(),
            'message' => 'Digital product retrieved successfully',
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $digitalProduct = DigitalProduct::where('tenant_id', Auth::user()->tenant_id)
                                       ->find($id);

        if (!$digitalProduct) {
            return response()->json([
                'message' => 'Digital product not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), DigitalProduct::rules($id));

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $digitalProduct->update([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'product_code' => $request->product_code,
            'description' => $request->description,
            'category' => $request->category,
            'cost_price' => $request->cost_price,
            'sell_price' => $request->sell_price,
            'provider_code' => $request->provider_code,
            'product_data' => $request->product_data,
            'is_active' => $request->is_active ?? true,
            'sort_order' => $request->sort_order ?? 0,
        ]);

        return response()->json([
            'data' => $digitalProduct->prepareAttributes(),
            'message' => 'Digital product updated successfully',
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $digitalProduct = DigitalProduct::where('tenant_id', Auth::user()->tenant_id)
                                       ->find($id);

        if (!$digitalProduct) {
            return response()->json([
                'message' => 'Digital product not found',
            ], 404);
        }

        // Check if product is being used in any sales
        if ($digitalProduct->digitalSales()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete product that has existing sales',
            ], 422);
        }

        $digitalProduct->delete();

        return response()->json([
            'message' => 'Digital product deleted successfully',
        ]);
    }

    /**
     * Get products by category
     */
    public function getByCategory(Request $request, string $category): JsonResponse
    {
        $products = DigitalProduct::where('tenant_id', Auth::user()->tenant_id)
                                ->where('category', $category)
                                ->active()
                                ->orderBy('sort_order')
                                ->get();

        return response()->json([
            'data' => $products->map(function ($product) {
                return $product->prepareAttributes();
            }),
            'total' => $products->count(),
            'message' => 'Digital products by category retrieved successfully',
        ]);
    }

    /**
     * Get active products
     */
    public function getActiveProducts(): JsonResponse
    {
        $products = DigitalProduct::where('tenant_id', Auth::user()->tenant_id)
                                ->active()
                                ->orderBy('sort_order')
                                ->get();

        return response()->json([
            'data' => $products->map(function ($product) {
                return $product->prepareAttributes();
            }),
            'total' => $products->count(),
            'message' => 'Active digital products retrieved successfully',
        ]);
    }
}
