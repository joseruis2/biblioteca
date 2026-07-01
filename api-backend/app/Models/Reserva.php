<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reserva extends Model
{
    protected $table = 'reservas';
    protected $fillable = [
        'user_id', 'libro_id',
        'fecha_reserva', 'fecha_expira', 'estado'
    ];

    protected $casts = [
        'fecha_reserva' => 'date',
        'fecha_expira'  => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function libro()
    {
        return $this->belongsTo(Libro::class, 'libro_id');
    }
}
