<?php

namespace App\Http\Controllers;

use App\Models\DigitalProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class DigitalProviderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $digitalProviders = DigitalProvider::all();

        $digitalProviders = $digitalProviders->map(function ($provider) {
            return $provider->prepareAttributes();
        })->values();

        return response()->json([
            'data' => $digitalProviders,
            'total' => DigitalProvider::count(),
            'message' => 'Digital providers retrieved successfully',
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $payload = $request->all();
        if (isset($payload['code'])) {
            $payload['code'] = strtoupper(trim($payload['code']));
        }
        if (isset($payload['name'])) {
            $payload['name'] = trim($payload['name']);
        }
        if (isset($payload['description']) && is_string($payload['description'])) {
            $payload['description'] = trim($payload['description']);
        }

        $validator = Validator::make($payload, DigitalProvider::rules(null, $request->hasFile('logo')), DigitalProvider::messages());

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first() ?? 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $logoPath = null;
        if ($request->hasFile('logo')) {
            $storedPath = $request->file('logo')->store('digital-providers', 'public');
            $logoPath = Storage::url($storedPath);
        } elseif (!empty($payload['logo_url'])) {
            $logoPath = trim($payload['logo_url']);
        }

        $digitalProvider = DigitalProvider::create([
            'name' => $payload['name'],
            'code' => $payload['code'],
            'description' => isset($payload['description']) && $payload['description'] !== '' ? $payload['description'] : null,
            'logo' => $logoPath,
            'is_active' => isset($payload['is_active']) ? filter_var($payload['is_active'], FILTER_VALIDATE_BOOLEAN) : true,
            'settings' => $payload['settings'] ?? [],
        ]);

        return response()->json([
            'data' => $digitalProvider->prepareAttributes(),
            'message' => 'Digital provider created successfully',
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $digitalProvider = DigitalProvider::find($id);

        if (!$digitalProvider) {
            return response()->json([
                'message' => 'Digital provider not found',
            ], 404);
        }

        return response()->json([
            'data' => $digitalProvider->prepareAttributes(),
            'message' => 'Digital provider retrieved successfully',
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $digitalProvider = DigitalProvider::find($id);

        if (!$digitalProvider) {
            return response()->json([
                'message' => 'Digital provider not found',
            ], 404);
        }

        $payload = $request->all();
        if (isset($payload['code'])) {
            $payload['code'] = strtoupper(trim($payload['code']));
        }
        if (isset($payload['name'])) {
            $payload['name'] = trim($payload['name']);
        }
        if (isset($payload['description']) && is_string($payload['description'])) {
            $payload['description'] = trim($payload['description']);
        }

        $validator = Validator::make($payload, DigitalProvider::rules($digitalProvider->id, $request->hasFile('logo')), DigitalProvider::messages());

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first() ?? 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $logoPath = $digitalProvider->logo;
        if ($request->hasFile('logo')) {
            $storedPath = $request->file('logo')->store('digital-providers', 'public');
            $logoPath = Storage::url($storedPath);
        } elseif (!empty($payload['logo_url'])) {
            $logoPath = trim($payload['logo_url']);
        }

        $digitalProvider->update([
            'name' => $payload['name'],
            'code' => $payload['code'],
            'description' => isset($payload['description']) && $payload['description'] !== '' ? $payload['description'] : null,
            'logo' => $logoPath,
            'is_active' => isset($payload['is_active']) ? filter_var($payload['is_active'], FILTER_VALIDATE_BOOLEAN) : $digitalProvider->is_active,
            'settings' => $payload['settings'] ?? $digitalProvider->settings,
        ]);

        return response()->json([
            'data' => $digitalProvider->prepareAttributes(),
            'message' => 'Digital provider updated successfully',
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $digitalProvider = DigitalProvider::find($id);

        if (!$digitalProvider) {
            return response()->json([
                'message' => 'Digital provider not found',
            ], 404);
        }

        // Check if provider is being used by any store
        $storeCount = $digitalProvider->storeDigitalProviders()->count();
        if ($storeCount > 0) {
            return response()->json([
                'message' => 'Cannot delete provider that is being used by stores',
            ], 422);
        }

        $digitalProvider->delete();

        return response()->json([
            'message' => 'Digital provider deleted successfully',
        ]);
    }

    /**
     * Get active digital providers
     */
    public function getActiveProviders(): JsonResponse
    {
        $providers = DigitalProvider::active()->get();

        return response()->json([
            'data' => $providers->map(function ($provider) {
                return $provider->prepareAttributes();
            }),
            'message' => 'Active digital providers retrieved successfully',
        ]);
    }
}
