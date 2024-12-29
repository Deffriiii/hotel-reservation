<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;
use App\Http\Resources\RoomResource;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class RoomController extends Controller
{
    /**
     * Menampilkan daftar semua kamar.
     */
    public function index(Request $request)
    {
        try {
            $query = Room::with('hotel');

            // Filter berdasarkan hotel_id jika ada
            if ($request->has('hotel_id')) {
                $query->where('hotel_id', $request->hotel_id);
            }

            // Filter berdasarkan range harga
            if ($request->has('min_price')) {
                $query->where('price', '>=', $request->min_price);
            }
            if ($request->has('max_price')) {
                $query->where('price', '<=', $request->max_price);
            }

            // Pengurutan
            $sortBy = $request->input('sort_by', 'created_at');
            $sortOrder = $request->input('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginasi
            $perPage = $request->input('per_page', 10);
            $rooms = $query->paginate($perPage);

            return RoomResource::collection($rooms);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mengambil data kamar',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menyimpan kamar baru.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'hotel_id' => 'required|exists:hotels,id',
                'number' => 'required|string',
                'name' => 'required|string|max:100',
                'price' => 'required|numeric|min:0',
                'description' => 'required|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg|max:5120'
            ]);

      
            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();

            // Upload gambar jika ada
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('rooms', 'public');
                $data['image'] = $path;  // Simpan path relatif saja
            }

            $room = Room::create($data);

            return new RoomResource($room);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menambahkan kamar',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menampilkan detail kamar tertentu.
     */
    public function show($id)
    {
        try {
            $room = Room::with('hotel')->findOrFail($id);
            return new RoomResource($room);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Kamar tidak ditemukan',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update kamar tertentu.
     */
    public function update(Request $request, $id)
    {
        try {
            $room = Room::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'hotel_id' => 'sometimes|required|exists:hotels,id',
                'name' => 'sometimes|required|string|max:100',
                'price' => 'sometimes|required|numeric|min:0',
                'description' => 'sometimes|required|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();

            // Upload dan update gambar jika ada
            if ($request->hasFile('image')) {
                if ($room->image) {
                    Storage::disk('public')->delete($room->image);
                }
                
                $path = $request->file('image')->store('rooms', 'public');
                $data['image'] = $path;  // Simpan path relatif saja
            }

            $room->update($data);

            return new RoomResource($room);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mengupdate kamar',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menghapus kamar tertentu.
     */
    public function destroy($id)
    {
        try {
            $room = Room::findOrFail($id);
            
            // Hapus gambar jika ada
            if ($room->image) {
                Storage::delete(str_replace('/storage', 'public', $room->image));
            }

            $room->delete();

            return response()->json([
                'message' => 'Kamar berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menghapus kamar',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}