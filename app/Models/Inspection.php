<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inspection extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'asset_id',
        'location',
        'condition',
        'estimate_cost',
        'finding',
        'analysis',
        'recommendation',
    ];

    

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(InspectionPhoto::class);
    }

    public function photosBefore(): HasMany
    {
        return $this->hasMany(InspectionPhoto::class)->where('type', 'before');
    }

    public function components(): HasMany
    {
        return $this->hasMany(Component::class);
    }

    
}
