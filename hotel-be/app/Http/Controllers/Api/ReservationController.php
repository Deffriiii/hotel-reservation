<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Room;
use Illuminate\Http\Request;
use App\Http\Resources\ReservationResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log; // Tambahkan import ini
use Carbon\Carbon;

class ReservationController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            Log::info('Mencoba mengambil data reservasi');
            
            $user = auth()->user();
            
            $reservations = Reservation::with(['user', 'room.hotel'])
                ->when($user->role !== 'admin', function($query) use ($user) {
                    return $query->where('user_id', $user->id);
                })
                ->latest()
                ->get();

            Log::info('Data reservasi berhasil diambil', [
                'total' => $reservations->count(),
                'user_id' => $user->id,
            ]);

            return response()->json([
                'status' => 'success',
                'data' => ReservationResource::collection($reservations),
            ]);

        } catch (\Exception $e) {
            Log::error('Error di ReservationController@index: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data reservasi',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    private function calculateTotalPrice($roomId, $checkIn, $checkOut, $guestCount): float
    {
        $room = Room::findOrFail($roomId);
        $checkInDate = Carbon::parse($checkIn);
        $checkOutDate = Carbon::parse($checkOut);
        $numberOfNights = max(1, $checkOutDate->diffInDays($checkInDate)); // At least 1 night

        return $room->price * $guestCount * $numberOfNights;
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'room_id' => 'required|exists:rooms,id',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'guest_count' => 'required|integer|min:1',
            'special_requests' => 'nullable|string',
        ]);

            // Tambahkan pengecekan user
        if (!auth()->user()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized',
            ], 401);
        }

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $totalPrice = $this->calculateTotalPrice(
                $request->room_id,
                $request->check_in,
                $request->check_out,
                $request->guest_count
            );

            $reservation = Reservation::create([
                'user_id' => auth()->id(),
                'room_id' => $request->room_id,
                'check_in' => $request->check_in,
                'check_out' => $request->check_out,
                'guest_count' => $request->guest_count,
                'total_price' => $totalPrice,
                'status' => 'pending',
                'special_requests' => $request->special_requests,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Reservation created successfully',
                'data' => new ReservationResource($reservation),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create reservation',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, Reservation $reservation): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'check_in' => 'sometimes|date|after_or_equal:today',
            'check_out' => 'sometimes|date|after:check_in',
            'guest_count' => 'sometimes|integer|min:1',
            'special_requests' => 'nullable|string',
            'status' => 'sometimes|in:pending,confirmed,cancelled,completed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            if ($request->hasAny(['room_id', 'check_in', 'check_out', 'guest_count'])) {
                $totalPrice = $this->calculateTotalPrice(
                    $request->room_id ?? $reservation->room_id,
                    $request->check_in ?? $reservation->check_in,
                    $request->check_out ?? $reservation->check_out,
                    $request->guest_count ?? $reservation->guest_count
                );
                $reservation->update(['total_price' => $totalPrice]);
            }

            $reservation->update($request->except('total_price'));

            return response()->json([
                'status' => 'success',
                'message' => 'Reservation updated successfully',
                'data' => new ReservationResource($reservation),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update reservation',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Reservation $reservation): JsonResponse
    {
        try {
            $reservation->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Reservation deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete reservation',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(Reservation $reservation): JsonResponse
    {
        try {
            return response()->json([
                'status' => 'success',
                'data' => new ReservationResource($reservation),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch reservation',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
