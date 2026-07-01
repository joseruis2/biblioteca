<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Autor;
use Illuminate\Http\Request;

class AutorController extends Controller
{
    public function index()
    {
        return response()->json(Autor::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre'       => 'required|string|max:150',
            'nacionalidad' => 'nullable|string',
            'biografia'    => 'nullable|string',
        ]);

        $autor = Autor::create($request->all());
        return response()->json($autor, 201);
    }

    public function update(Request $request, $id)
    {
        $autor = Autor::findOrFail($id);
        $autor->update($request->all());
        return response()->json($autor);
    }

    public function destroy($id)
    {
        Autor::findOrFail($id)->delete();
        return response()->json(['message' => 'Autor eliminado.']);
    }
}
