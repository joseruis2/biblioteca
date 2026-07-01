<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PrestamoResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'socio'            => $this->socio?->nombre,
            'libro'            => $this->libro?->titulo,
            'bibliotecario'    => $this->bibliotecario?->nombre,
            'fecha_prestamo'   => $this->fecha_prestamo,
            'fecha_devolucion' => $this->fecha_devolucion,
            'fecha_retorno'    => $this->fecha_retorno,
            'estado'           => $this->estado,
            'observaciones'    => $this->observaciones,
            'multa'            => $this->multa ? [
                'monto'  => $this->multa->monto,
                'estado' => $this->multa->estado,
            ] : null,
        ];
    }
}
