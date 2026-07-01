<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Multa extends Model
{
    protected $table = 'multas';
    protected $fillable = [
        'prestamo_id', 'user_id',
        'dias_retraso', 'monto', 'estado', 'fecha_pago'
    ];

    protected $casts = ['fecha_pago' => 'date'];

    public function prestamo()
    {
        return $this->belongsTo(Prestamo::class, 'prestamo_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
