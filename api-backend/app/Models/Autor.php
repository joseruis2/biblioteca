<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Autor extends Model
{
    protected $table = 'autores';
    protected $fillable = ['nombre', 'nacionalidad', 'biografia'];

    public function libros()
    {
        return $this->belongsToMany(Libro::class, 'libro_autor');
    }
}
