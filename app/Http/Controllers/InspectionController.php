<?php

namespace App\Http\Controllers;

use App\Models\Inspection; // ✅ Ditambahkan
use App\Models\Customer;   // ✅ Ditambahkan
use App\Models\Asset;      // ✅ Ditambahkan
use App\Models\Component;
use App\Models\InspectionPhoto;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class InspectionController extends Controller
{
    /**
     * Display a listing of inspections.
     */
    public function index(Request $request)
    {
        $query = Inspection::with('user', 'customer', 'asset');

        if ($request->has('customer_id') && $request->input('customer_id') !== '') {
            $query->where('customer_id', $request->input('customer_id'));
        }

        return Inertia::render('Inspections/Index', [
            'inspections' => $query->latest()->paginate(10),
            'customers' => Customer::all(['id', 'name']),
        ]);
    }

    /**
     * Show the form for creating a new inspection.
     */
    public function create()
    {
        return Inertia::render('Inspections/Create', [
            'customers' => Customer::all(['id', 'name']),
            'assets' => Asset::all(['id', 'customer_id', 'name', 'location']),
        ]);
    }

    /**
     * Store a newly created inspection.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'asset_id' => 'nullable|exists:assets,id',
            'location' => 'required|string|max:255',
            'condition' => 'required|string|max:255',
            'estimate_cost' => 'nullable|string|max:255',
            'finding' => 'required|string',
            'analysis' => 'nullable|string',
            'recommendation' => 'nullable|string',

            'photos_before' => 'nullable|array',
            'photos_before.*' => 'image|max:2048',

            'components' => 'nullable|array',
            'components.*.name' => 'required|string|max:255',
            'components.*.function' => 'required|string|max:255',
            'components.*.condition' => 'required|string',
            'components.*.check_results' => 'required|string',
            'components.*.photos_component' => 'nullable|array',
            'components.*.photos_component.*' => 'image|max:2048',
            'components.*.photos_check' => 'nullable|array',
            'components.*.photos_check.*' => 'image|max:2048',
        ]);

        $inspection = $request->user()->inspections()->create([
            'customer_id' => $validated['customer_id'],
            'asset_id' => $validated['asset_id'],
            'location' => $validated['location'],
            'condition' => $validated['condition'],
            'estimate_cost' => $validated['estimate_cost'],
            'finding' => $validated['finding'],
            'analysis' => $validated['analysis'],
            'recommendation' => $validated['recommendation'],
        ]);

        // Upload photos_before
        if ($request->hasFile('photos_before')) {
            foreach ($request->file('photos_before') as $photo) {
                $path = $photo->store('inspection_photos', 'public');
                $inspection->photos()->create(['path' => $path, 'type' => 'before']);
            }
        }

        // Handle components
        if ($request->has('components')) {
            foreach ($validated['components'] as $componentData) {
                $component = $inspection->components()->create([
                    'name' => $componentData['name'],
                    'function' => $componentData['function'],
                    'condition' => $componentData['condition'],
                    'check_results' => $componentData['check_results'],
                ]);

                // Upload photos_component
                if (isset($componentData['photos_component']) && is_array($componentData['photos_component'])) {
                    foreach ($componentData['photos_component'] as $photo) {
                        if ($photo instanceof \Illuminate\Http\UploadedFile) {
                            $path = $photo->store('component_photos', 'public');
                            $component->photos()->create(['path' => $path, 'type' => 'component']);
                        }
                    }
                }

                // Upload photos_check
                if (isset($componentData['photos_check']) && is_array($componentData['photos_check'])) {
                    foreach ($componentData['photos_check'] as $photo) {
                        if ($photo instanceof \Illuminate\Http\UploadedFile) {
                            $path = $photo->store('component_photos', 'public');
                            $component->photos()->create(['path' => $path, 'type' => 'check']);
                        }
                    }
                }
            }
        }

        return redirect()->route('dashboard')->with('success', 'Inspeksi berhasil ditambahkan.');
    }

    /**
     * Display the specified inspection.
     */
    public function show(Inspection $inspection)
    {
        $inspection->load([
            'user',
            'customer',
            'asset',
            'photos' => function ($query) {
                $query->where('type', 'before');
            },
            'components.photos' => function ($query) {
                $query->whereIn('type', ['component', 'check']);
            },
        ]);

        return Inertia::render('Inspections/Show', [
            'inspection' => $inspection,
        ]);
    }

    /**
     * Show the form for editing the inspection.
     */
    public function edit(Inspection $inspection)
    {
        $inspection->load([
            'customer',
            'asset',
            'photos' => function ($query) {
                $query->where('type', 'before');
            },
            'components.photos' => function ($query) {
                $query->whereIn('type', ['component', 'check']);
            },
        ]);

        return Inertia::render('Inspections/Edit', [
            'inspection' => $inspection,
            'customers' => Customer::all(['id', 'name']),
            'assets' => Asset::all(['id', 'customer_id', 'name', 'location']),
        ]);
    }

    /**
     * Update the specified inspection.
     */
    public function update(Request $request, Inspection $inspection)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'asset_id' => 'nullable|exists:assets,id',
            'location' => 'required|string|max:255',
            'condition' => 'required|string|max:255',
            'estimate_cost' => 'nullable|string|max:255',
            'finding' => 'required|string',
            'analysis' => 'nullable|string',
            'recommendation' => 'nullable|string',

            'photos_before' => 'nullable|array',
            'photos_before.*' => 'image|max:2048',

            'components' => 'nullable|array',
            'components.*.id' => 'nullable|exists:components,id',
            'components.*.name' => 'required|string|max:255',
            'components.*.function' => 'required|string|max:255',
            'components.*.condition' => 'required|string',
            'components.*.check_results' => 'required|string',
            'components.*.photos_component' => 'nullable|array',
            'components.*.photos_component.*' => 'image|max:2048',
            'components.*.photos_check' => 'nullable|array',
            'components.*.photos_check.*' => 'image|max:2048',
            'components.*._delete_photos_component' => 'nullable|array',
            'components.*._delete_photos_component.*' => 'exists:component_photos,id',
            'components.*._delete_photos_check' => 'nullable|array',
            'components.*._delete_photos_check.*' => 'exists:component_photos,id',

            '_delete_components' => 'nullable|array',
            '_delete_components.*' => 'exists:components,id',

            '_delete_photos_before' => 'nullable|array',
            '_delete_photos_before.*' => 'exists:inspection_photos,id',
        ]);

        // Update inspection data
        $inspection->update([
            'customer_id' => $validated['customer_id'],
            'asset_id' => $validated['asset_id'],
            'location' => $validated['location'],
            'condition' => $validated['condition'],
            'estimate_cost' => $validated['estimate_cost'],
            'finding' => $validated['finding'],
            'analysis' => $validated['analysis'],
            'recommendation' => $validated['recommendation'],
        ]);

        // Handle new inspection photos (before)
        if ($request->hasFile('photos_before')) {
            foreach ($request->file('photos_before') as $photo) {
                $path = $photo->store('inspection_photos', 'public');
                $inspection->photos()->create(['path' => $path, 'type' => 'before']);
            }
        }

        // Handle component updates
        if ($request->has('components')) {
            foreach ($validated['components'] as $componentData) {
                if (isset($componentData['id'])) {
                    $component = $inspection->components()->find($componentData['id']);
                } else {
                    $component = null;
                }

                if ($component) {
                    $component->update([
                        'name' => $componentData['name'],
                        'function' => $componentData['function'],
                        'condition' => $componentData['condition'],
                        'check_results' => $componentData['check_results'],
                    ]);
                } else {
                    $component = $inspection->components()->create([
                        'name' => $componentData['name'],
                        'function' => $componentData['function'],
                        'condition' => $componentData['condition'],
                        'check_results' => $componentData['check_results'],
                    ]);
                }

                // Upload new component photos
                if (isset($componentData['photos_component']) && is_array($componentData['photos_component'])) {
                    foreach ($componentData['photos_component'] as $photo) {
                        if ($photo instanceof \Illuminate\Http\UploadedFile) {
                            $path = $photo->store('component_photos', 'public');
                            $component->photos()->create(['path' => $path, 'type' => 'component']);
                        }
                    }
                }

                if (isset($componentData['photos_check']) && is_array($componentData['photos_check'])) {
                    foreach ($componentData['photos_check'] as $photo) {
                        if ($photo instanceof \Illuminate\Http\UploadedFile) {
                            $path = $photo->store('component_photos', 'public');
                            $component->photos()->create(['path' => $path, 'type' => 'check']);
                        }
                    }
                }

                // Delete component photos (component type)
                if (isset($componentData['_delete_photos_component'])) {
                    foreach ($componentData['_delete_photos_component'] as $photoId) {
                        $photo = $component->photos()->where('id', $photoId)->where('type', 'component')->first();
                        if ($photo) {
                            Storage::disk('public')->delete($photo->path);
                            $photo->delete();
                        }
                    }
                }

                // Delete component photos (check type)
                if (isset($componentData['_delete_photos_check'])) {
                    foreach ($componentData['_delete_photos_check'] as $photoId) {
                        $photo = $component->photos()->where('id', $photoId)->where('type', 'check')->first();
                        if ($photo) {
                            Storage::disk('public')->delete($photo->path);
                            $photo->delete();
                        }
                    }
                }
            }
        }

        // Delete entire components
        if ($request->has('_delete_components')) {
            foreach ($request->input('_delete_components') as $componentId) {
                $component = $inspection->components()->find($componentId);
                if ($component) {
                    foreach ($component->photos as $photo) {
                        Storage::disk('public')->delete($photo->path);
                        $photo->delete();
                    }
                    $component->delete();
                }
            }
        }

        // Delete inspection photos (before)
        if ($request->has('_delete_photos_before')) {
            foreach ($request->input('_delete_photos_before') as $photoId) {
                $photo = $inspection->photos()->where('id', $photoId)->where('type', 'before')->first();
                if ($photo) {
                    Storage::disk('public')->delete($photo->path);
                    $photo->delete();
                }
            }
        }

        return redirect()->route('inspections.index')->with('success', 'Inspeksi berhasil diperbarui.');
    }

    /**
     * Delete entire components
     */
    // Handle deletion of components
    }
