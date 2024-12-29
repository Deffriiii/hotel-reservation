<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RoomResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'hotel_id' => $this->hotel_id,
            'hotel' => $this->whenLoaded('hotel', function () {
                return [
                    'id' => $this->hotel->id,
                    'name' => $this->hotel->name,
                ];
            }),
            'name' => $this->name,
            'number' => $this->number,
            'price' => $this->price,
            'formatted_price' => $this->formatRupiah($this->price), 
            'description' => $this->description,
            'image' => $this->image,
            'image_url' => $this->image_url,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    private function formatRupiah($price)
    {
        if (is_null($price) || $price === 0) {
            return 'Rp.0';
        }
        return 'Rp.' . number_format($price, 0, '', '.');
    }
}