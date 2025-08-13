<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        return Inertia::render('Customers/Index', [
            'customers' => Customer::latest()->paginate(10),
        ]);
    }

    public function create()
    {
        return Inertia::render('Customers/Create');
    }

    public function store(Request $request)
    {
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'issue_note' => 'nullable|string',
            'photo' => 'nullable|image|max:2048',
        ]);
    

        $path = null;
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('customer_photos', 'public');
        }

        Customer::create(array_merge($validated, ['photo_path' => $path]));

        return redirect()->route('customers.index')->with('success', 'Customer berhasil ditambahkan.');
    }

    public function edit(Customer $customer)
    {
        return Inertia::render('Customers/Edit', [
            'customer' => $customer,
        ]);
    }

    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'issue_note' => 'nullable|string',
            'photo' => 'nullable|image|max:2048',
        ]);

        $path = $customer->photo_path;
        if ($request->hasFile('photo')) {
            if ($path) {
                // Delete old photo if exists
                // Storage::disk('public')->delete($path);
            }
            $path = $request->file('photo')->store('customer_photos', 'public');
        }

        $customer->update(array_merge($validated, ['photo_path' => $path]));

        return redirect()->route('customers.index')->with('success', 'Customer berhasil diperbarui.');
    }

    public function destroy(Customer $customer)
    {
        // if ($customer->photo_path) {
        //     Storage::disk('public')->delete($customer->photo_path);
        // }
        $customer->delete();

        return redirect()->route('customers.index')->with('success', 'Customer berhasil dihapus.');
    }
}
