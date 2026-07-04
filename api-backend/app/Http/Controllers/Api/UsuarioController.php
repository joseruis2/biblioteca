<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    public function index()
    {
        $usuarios = User::with('rol')->orderBy('id')->get();
        return UserResource::collection($usuarios);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'nombre'   => 'required|string|max:100',
            'email'    => 'required|email|unique:users,email,' . $id,
            'rol_id'   => 'required|exists:roles,id',
            'telefono' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:6',
        ]);

        $data = $request->only(['nombre', 'email', 'rol_id', 'telefono']);
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);
        return new UserResource($user->load('rol'));
    }

    public function toggle($id)
    {
        $user = User::findOrFail($id);
        $user->update(['estado' => !$user->estado]);
        return response()->json([
            'message' => $user->estado ? 'Usuario activado.' : 'Usuario desactivado.',
            'estado'  => $user->estado,
        ]);
    }
}
