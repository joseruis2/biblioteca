<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Libro\StoreLibroRequest;
use App\Http\Requests\Libro\UpdateLibroRequest;
use App\Http\Resources\LibroResource;
use App\Models\Libro;
use Illuminate\Http\Request;

class LibroController extends Controller
{
    public function index()
    {
        $libros = Libro::with(['categoria', 'autores'])
            ->where('estado', 1)
            ->paginate(12);

        return LibroResource::collection($libros);
    }

    public function show($id)
    {
        $libro = Libro::with(['categoria', 'autores'])->findOrFail($id);
        return new LibroResource($libro);
    }

    public function store(StoreLibroRequest $request)
    {
        $libro = Libro::create([
            ...$request->validated(),
            'stock_disponible' => $request->stock_total,
        ]);

        $libro->autores()->sync($request->autores);

        return new LibroResource($libro->load(['categoria', 'autores']));
    }

    public function update(UpdateLibroRequest $request, $id)
    {
        $libro = Libro::findOrFail($id);
        $libro->update($request->validated());

        if ($request->has('autores')) {
            $libro->autores()->sync($request->autores);
        }

        return new LibroResource($libro->load(['categoria', 'autores']));
    }

    public function destroy($id)
    {
        $libro = Libro::findOrFail($id);
        $libro->update(['estado' => 0]);
        return response()->json(['message' => 'Libro desactivado.']);
    }
}
