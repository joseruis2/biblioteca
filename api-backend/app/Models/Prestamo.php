<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prestamo extends Model
{
    protected $table = 'prestamos';
    protected $fillable = [
        'user_id', 'libro_id', 'bibliotecario_id',
        'fecha_prestamo', 'fecha_devolucion',
        'fecha_retorno', 'estado', 'observaciones'
    ];

    protected $casts = [
        'fecha_prestamo'   => 'date',
        'fecha_devolucion' => 'date',
        'fecha_retorno'    => 'date',
    ];

    public function socio()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function bibliotecario()
    {
        return $this->belongsTo(User::class, 'bibliotecario_id');
    }

    public function libro()
    {
        return $this->belongsTo(Libro::class, 'libro_id');
    }

    public function multa()
    {
        return $this->hasOne(Multa::class, 'prestamo_id');
    }
}
