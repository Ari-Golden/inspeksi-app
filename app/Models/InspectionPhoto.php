<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class InspectionPhoto extends Model
{
    use HasFactory;

    protected $fillable = ['path', 'type'];

    protected $appends = ['url'];

    public function inspection(): BelongsTo
    {
        return $this->belongsTo(Inspection::class);
    }

    public function getUrlAttribute()
    {
        return $this->path ? Storage::url($this->path) : null;
    }
}
