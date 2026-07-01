<?php

namespace App\Http\Requests\Reserva;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreReservaRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'libro_id' => 'required|exists:libros,id',
        ];
    }
}
