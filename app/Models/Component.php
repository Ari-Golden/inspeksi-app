<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Component extends Model
{
    protected $fillable = [
        'inspection_id',
        'name',
        'function',
        'condition',
        'check_results',
    ];

    public function inspection()
    {
        return $this->belongsTo(Inspection::class);
    }

    public function photos()
    {
        return $this->hasMany(ComponentPhoto::class);
    }

    public function photosComponent()
    {
        return $this->hasMany(ComponentPhoto::class)->where('type', 'component');
    }

    public function photosCheck()
    {
        return $this->hasMany(ComponentPhoto::class)->where('type', 'check');
    }
}
