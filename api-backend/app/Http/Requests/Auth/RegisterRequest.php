<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'nombre'       => 'required|string|max:100',
            'email'        => 'required|email|unique:users,email',
            'password'     => 'required|string|min:6|confirmed',
            'rol_id'       => 'required|exists:roles,id',
            'numero_socio' => 'nullable|string|unique:users,numero_socio',
            'telefono'     => 'nullable|string|max:20',
        ];
    }
}
