<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function general()
    {
        $customers = Customer::with([
            'assets' => function ($query) {
                $query->with([
                    'inspections' => function ($query) {
                        $query->with([
                            'components' => function ($query) {
                                $query->with('photos');
                            }
                        ])->orderByDesc('created_at'); // Order inspections by latest
                    }
                ]);
            }
        ])->get();

        return Inertia::render('Reports/General', [
            'customers' => $customers,
        ]);
    }
}
