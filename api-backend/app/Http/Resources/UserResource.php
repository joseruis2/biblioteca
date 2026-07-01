<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'           => $this->id,
            'nombre'       => $this->nombre,
            'email'        => $this->email,
            'numero_socio' => $this->numero_socio,
            'telefono'     => $this->telefono,
            'estado'       => $this->estado,
            'rol'          => $this->rol?->nombre,
        ];
    }
}
