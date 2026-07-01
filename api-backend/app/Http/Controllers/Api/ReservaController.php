<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reserva\StoreReservaRequest;
use App\Models\Reserva;
use Illuminate\Http\Request;

class ReservaController extends Controller
{
    public function index(Request $request)
    {
        $reservas = Reserva::with(['user', 'libro'])
            ->where('user_id', $request->user()->id)
            ->latest()->get();
        return response()->json($reservas);
    }

    public function store(StoreReservaRequest $request)
    {
        $reserva = Reserva::create([
            'user_id'       => $request->user()->id,
            'libro_id'      => $request->libro_id,
            'fecha_reserva' => now()->toDateString(),
            'fecha_expira'  => now()->addDays(3)->toDateString(),
            'estado'        => 'PENDIENTE',
        ]);

        return response()->json($reserva->load(['user', 'libro']), 201);
    }

    public function cancelar($id, Request $request)
    {
        $reserva = Reserva::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $reserva->update(['estado' => 'CANCELADA']);
        return response()->json(['message' => 'Reserva cancelada.']);
    }
}
