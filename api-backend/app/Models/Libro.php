<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Libro extends Model
{
    protected $table = 'libros';
    protected $fillable = [
        'categoria_id', 'titulo', 'isbn', 'editorial',
        'anio_publicacion', 'descripcion', 'portada_url',
        'stock_total', 'stock_disponible', 'estado'
    ];

    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    public function autores()
    {
        return $this->belongsToMany(Autor::class, 'libro_autor');
    }

    public function prestamos()
    {
        return $this->hasMany(Prestamo::class, 'libro_id');
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'libro_id');
    }
}
