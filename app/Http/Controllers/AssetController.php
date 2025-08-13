<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class AssetController extends Controller
{
    public function index()
    {
        return Inertia::render('Assets/Index', [
            'customers' => Customer::with(['assets' => function($query) {
                $query->with('photos', 'customer');
            }])->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Assets/Create', [
            'customers' => Customer::all(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:255',
            'location' => 'required|string|max:255',
            'note' => 'nullable|string',
            'photos' => 'nullable|array',
            'photos.*' => 'image|max:2048',
        ]);

        $asset = Asset::create($validated);

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('asset_photos', 'public');
                $asset->photos()->create(['path' => $path]);
            }
        }

        return redirect()->route('assets.index')->with('success', 'Asset berhasil ditambahkan.');
    }

    public function edit(Asset $asset)
    {
        return Inertia::render('Assets/Edit', [
            'asset' => $asset->load('customer', 'photos'),
            'customers' => Customer::all(['id', 'name']),
        ]);
    }

    public function update(Request $request, Asset $asset)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:255',
            'location' => 'required|string|max:255',
            'note' => 'nullable|string',
            'photos' => 'nullable|array',
            'photos.*' => 'image|max:2048',
            '_delete_photos' => 'nullable|array',
            '_delete_photos.*' => 'exists:asset_photos,id',
        ]);

        $asset->update($validated);

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('asset_photos', 'public');
                $asset->photos()->create(['path' => $path]);
            }
        }

        if ($request->has('_delete_photos')) {
            foreach ($request->get('_delete_photos') as $photoId) {
                $photo = $asset->photos()->find($photoId);
                if ($photo) {
                    Storage::disk('public')->delete($photo->path);
                    $photo->delete();
                }
            }
        }

        return redirect()->route('assets.index')->with('success', 'Asset berhasil diperbarui.');
    }

    public function destroy(Asset $asset)
    {
        foreach ($asset->photos as $photo) {
            Storage::disk('public')->delete($photo->path);
            $photo->delete();
        }
        $asset->delete();

        return redirect()->route('assets.index')->with('success', 'Asset berhasil dihapus.');
    }
}
