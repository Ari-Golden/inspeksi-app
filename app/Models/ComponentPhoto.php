<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComponentPhoto extends Model
{
    protected $fillable = [
        'component_id',
        'path',
        'type',
    ];

    protected $appends = ['url'];

    public function component()
    {
        return $this->belongsTo(Component::class);
    }

    public function getUrlAttribute()
    {
        return $this->path ? Storage::url($this->path) : null;
    }
}
