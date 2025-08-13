<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Asset extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'name',
        'code',
        'location',
        'note',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(AssetPhoto::class);
    }

    public function inspections(): HasMany
    {
        return $this->hasMany(Inspection::class);
    }
}
