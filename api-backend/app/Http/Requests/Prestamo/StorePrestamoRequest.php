<?php

namespace App\Http\Requests\Prestamo;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePrestamoRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'user_id'          => 'required|exists:users,id',
            'libro_id'         => 'required|exists:libros,id',
            'fecha_devolucion' => 'required|date|after:today',
            'observaciones'    => 'nullable|string',
        ];
    }
}
