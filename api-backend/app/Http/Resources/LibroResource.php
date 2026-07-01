<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LibroResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'titulo'           => $this->titulo,
            'isbn'             => $this->isbn,
            'editorial'        => $this->editorial,
            'anio_publicacion' => $this->anio_publicacion,
            'descripcion'      => $this->descripcion,
            'portada_url'      => $this->portada_url,
            'stock_total'      => $this->stock_total,
            'stock_disponible' => $this->stock_disponible,
            'estado'           => $this->estado,
            'categoria'        => $this->categoria?->nombre,
            'autores'          => $this->autores->pluck('nombre'),
        ];
    }
}
