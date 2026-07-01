<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'rol_id', 'nombre', 'email', 'password',
        'numero_socio', 'telefono', 'estado'
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = ['email_verified_at' => 'datetime'];

    public function rol()
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }

    public function prestamos()
    {
        return $this->hasMany(Prestamo::class, 'user_id');
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'user_id');
    }

    public function multas()
    {
        return $this->hasMany(Multa::class, 'user_id');
    }
}
