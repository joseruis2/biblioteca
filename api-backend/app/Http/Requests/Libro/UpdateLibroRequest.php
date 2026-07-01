<?php

namespace App\Http\Requests\Libro;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateLibroRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'categoria_id'      => 'sometimes|exists:categorias,id',
            'titulo'            => 'sometimes|string|max:255',
            'isbn'              => 'nullable|string|unique:libros,isbn,' . $this->route('libro'),
            'editorial'         => 'nullable|string|max:150',
            'anio_publicacion'  => 'nullable|integer|min:1000|max:2099',
            'descripcion'       => 'nullable|string',
            'portada_url'       => 'nullable|url',
            'stock_total'       => 'sometimes|integer|min:1',
            'autores'           => 'sometimes|array|min:1',
            'autores.*'         => 'exists:autores,id',
        ];
    }
}
