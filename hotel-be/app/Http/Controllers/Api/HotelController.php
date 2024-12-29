<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class HotelController extends Controller
{
    public function index()
    {
        $hotels = Hotel::latest()->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $hotels->map(function($hotel) {
                return [
                    'id' => $hotel->id,
                    'name' => $hotel->name,
                    'address' => $hotel->address,
                    'description' => $hotel->description,
                    'image_url' => $hotel->image ? asset('storage/' . $hotel->image) : null,
                    'created_at' => $hotel->created_at,
                    'updated_at' => $hotel->updated_at
                ];
            })
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'address' => 'required|string',
            'description' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->all();

            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $path = $image->store('hotels', 'public');
                $data['image'] = $path;
            }

            $hotel = Hotel::create($data);

            return response()->json([
                'status' => 'success',
                'message' => 'Hotel berhasil ditambahkan',
                'data' => [
                    'id' => $hotel->id,
                    'name' => $hotel->name,
                    'address' => $hotel->address,
                    'description' => $hotel->description,
                    'image_url' => $hotel->image ? asset('storage/' . $hotel->image) : null,
                    'created_at' => $hotel->created_at,
                    'updated_at' => $hotel->updated_at
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat menyimpan data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $hotel = Hotel::findOrFail($id);
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'id' => $hotel->id,
                    'name' => $hotel->name,
                    'address' => $hotel->address,
                    'description' => $hotel->description,
                    'image_url' => $hotel->image ? asset('storage/' . $hotel->image) : null,
                    'created_at' => $hotel->created_at,
                    'updated_at' => $hotel->updated_at
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hotel tidak ditemukan'
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'address' => 'required|string',
            'description' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $hotel = Hotel::findOrFail($id);
            $data = $request->all();

            if ($request->hasFile('image')) {
                // Hapus gambar lama jika ada
                if ($hotel->image) {
                    Storage::disk('public')->delete($hotel->image);
                }

                // Upload gambar baru
                $image = $request->file('image');
                $path = $image->store('hotels', 'public');
                $data['image'] = $path;
            }

            $hotel->update($data);

            return response()->json([
                'status' => 'success',
                'message' => 'Hotel berhasil diperbarui',
                'data' => [
                    'id' => $hotel->id,
                    'name' => $hotel->name,
                    'address' => $hotel->address,
                    'description' => $hotel->description,
                    'image_url' => $hotel->image ? asset('storage/' . $hotel->image) : null,
                    'created_at' => $hotel->created_at,
                    'updated_at' => $hotel->updated_at
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hotel tidak ditemukan'
            ], 404);
        }
    }

    public function destroy($id)
    {
        try {
            $hotel = Hotel::findOrFail($id);

            // Hapus gambar jika ada
            if ($hotel->image) {
                Storage::disk('public')->delete($hotel->image);
            }

            $hotel->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Hotel berhasil dihapus'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hotel tidak ditemukan'
            ], 404);
        }
    }
}