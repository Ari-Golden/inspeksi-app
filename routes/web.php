<?php

use App\Http\Controllers\AssetController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\InspectionController;
use App\Http\Controllers\ReportController;
use App\Models\Inspection;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard', [
            'inspections' => Inspection::with('user', 'customer', 'asset')->latest()->paginate(5),
        ]);
    })->name('dashboard');

    Route::get('/inspections', [InspectionController::class, 'index'])->name('inspections.index');
    Route::get('/inspections/create', [InspectionController::class, 'create'])->name('inspections.create');
    Route::post('/inspections', [InspectionController::class, 'store'])->name('inspections.store');
    Route::get('/inspections/{inspection}', [InspectionController::class, 'show'])->name('inspections.show');
    Route::get('/inspections/{inspection}/edit', [InspectionController::class, 'edit'])->name('inspections.edit');
    Route::patch('/inspections/{inspection}', [InspectionController::class, 'update'])->name('inspections.update');

    Route::resource('customers', CustomerController::class);
    Route::resource('assets', AssetController::class);

    Route::get('/reports/general', [ReportController::class, 'general'])->name('reports.general');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
