<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rol extends Model
{
    protected $table = 'roles';
    protected $fillable = ['nombre'];
    public $timestamps = false; // ← agrega esto

    public function users()
    {
        return $this->hasMany(User::class, 'rol_id');
    }
}
