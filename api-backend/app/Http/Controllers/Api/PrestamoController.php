<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Prestamo\StorePrestamoRequest;
use App\Http\Resources\PrestamoResource;
use App\Models\Libro;
use App\Models\Multa;
use App\Models\Prestamo;
use Illuminate\Http\Request;

class PrestamoController extends Controller
{
    public function index()
    {
        $prestamos = Prestamo::with(['socio', 'libro', 'bibliotecario', 'multa'])
            ->latest()->paginate(15);
        return PrestamoResource::collection($prestamos);
    }

    public function store(StorePrestamoRequest $request)
    {
        $libro = Libro::findOrFail($request->libro_id);

        if ($libro->stock_disponible <= 0) {
            return response()->json(['message' => 'No hay stock disponible.'], 422);
        }

        $prestamo = Prestamo::create([
            'user_id'          => $request->user_id,
            'libro_id'         => $request->libro_id,
            'bibliotecario_id' => $request->user()->id,
            'fecha_prestamo'   => now()->toDateString(),
            'fecha_devolucion' => $request->fecha_devolucion,
            'estado'           => 'ACTIVO',
            'observaciones'    => $request->observaciones,
        ]);

        $libro->decrement('stock_disponible');

        return new PrestamoResource($prestamo->load(['socio', 'libro', 'bibliotecario']));
    }

    public function devolver($id)
    {
        $prestamo = Prestamo::with('libro')->findOrFail($id);

        if ($prestamo->estado === 'DEVUELTO') {
            return response()->json(['message' => 'Ya fue devuelto.'], 422);
        }

        $hoy          = now()->toDateString();
        $diasRetraso  = max(0, now()->diffInDays($prestamo->fecha_devolucion, false) * -1);

        $prestamo->update([
            'estado'        => 'DEVUELTO',
            'fecha_retorno' => $hoy,
        ]);

        $prestamo->libro->increment('stock_disponible');

        if ($diasRetraso > 0) {
            Multa::create([
                'prestamo_id'  => $prestamo->id,
                'user_id'      => $prestamo->user_id,
                'dias_retraso' => $diasRetraso,
                'monto'        => $diasRetraso * 1.00,
                'estado'       => 'PENDIENTE',
            ]);
        }

        return new PrestamoResource($prestamo->load(['socio', 'libro', 'multa']));
    }
}
