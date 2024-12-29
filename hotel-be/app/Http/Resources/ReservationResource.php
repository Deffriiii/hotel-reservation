<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Log;

class ReservationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        try {
            return [
                'id' => $this->id,
                'user' => $this->whenLoaded('user', function () {
                    return [
                        'id' => $this->user->id,
                        'name' => $this->user->name,
                        'email' => $this->user->email,
                        'role' => $this->user->role
                    ];
                }),
                'room' => $this->whenLoaded('room', function () {
                    return [
                        'id' => $this->room->id,
                        'number' => $this->room->number,
                        'hotel_id' => $this->room->hotel_id,
                        'name' => $this->room->name,
                        'price' => $this->room->price,
                        'description' => $this->room->description,
                        'image' => $this->room->image,
                        'image_url' => $this->room->image_url,
                        'hotel' => $this->room->hotel ? [
                            'id' => $this->room->hotel->id,
                            'name' => $this->room->hotel->name,
                            // Tambahkan field hotel lain yang diperlukan
                        ] : null
                    ];
                }),
                'check_in' => $this->check_in,
                'check_out' => $this->check_out,
                'guest_count' => $this->guest_count,
                'total_price' => $this->total_price,
                'status' => $this->status,
                'special_requests' => $this->special_requests,
                'created_at' => $this->created_at,
                'updated_at' => $this->updated_at
            ];
        } catch (\Exception $e) {
            Log::error('Error di ReservationResource: ' . $e->getMessage());
            return [
                'id' => $this->id ?? null,
                'error' => 'Tidak dapat memuat detail reservasi: ' . $e->getMessage()
            ];
        }
    }
}   