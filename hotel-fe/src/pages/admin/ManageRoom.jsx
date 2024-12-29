import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { formatRupiah } from '../../utils/formatters';

const Alert = ({ message, description, type, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-auto p-6">
        <div className="flex flex-col items-center justify-between w-full text-center">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className={`${type === 'success' ? 'text-green-500' : type === 'error' ? 'text-red-500' : 'text-yellow-500'} p-3 rounded-lg`}>
              {type === 'success' ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              ) : type === 'error' ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-gray-900 text-xl font-semibold mb-2">{message}</p>
              <p className="text-gray-600 text-base">{description}</p>
            </div>
          </div>
          {onConfirm ? (
            <div className="flex justify-center space-x-4 w-full mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors duration-300"
              >
                Batal
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-300"
              >
                Hapus
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="mt-6 text-gray-500 hover:text-gray-700 p-2 rounded-full transition-colors"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ManageRoom = () => {
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({
    hotel_id: '',
    number: '',
    name: '',
    price: '',
    description: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    description: '',
    type: 'success'
  });

  useEffect(() => {
    fetchRooms();
    fetchHotels();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/v1/rooms');
      setRooms(response.data.data);
      setLoading(false);
    } catch (error) {
      showAlert('Error', 'Gagal mengambil data kamar', 'error');
      setLoading(false);
    }
  };

  const fetchHotels = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/v1/hotels');
      setHotels(response.data.data);
    } catch (error) {
      showAlert('Error', 'Gagal mengambil data hotel', 'error');
    }
  };

  const handleOpenModal = (room = null) => {
    if (room) {
      setSelectedRoom(room);
      setFormData({
        hotel_id: room.hotel_id,
        number: room.number,
        name: room.name,
        price: parseFloat(room.price),
        description: room.description,
        image: null,
      });
      setImagePreview(room.image_url);
    } else {
      setSelectedRoom(null);
      setFormData({
        hotel_id: '',
        number: '',
        name: '',
        price: '',
        description: '',
        image: null,
      });
      setImagePreview(null);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      if (selectedRoom) {
        formDataToSend.append('_method', 'PUT');
        await axios.post(`http://127.0.0.1:8000/api/v1/rooms/${selectedRoom.id}`, formDataToSend);
        showAlert('Berhasil', 'Data kamar berhasil diperbarui', 'success');
      } else {
        await axios.post('http://127.0.0.1:8000/api/v1/rooms', formDataToSend);
        showAlert('Berhasil', 'Kamar baru berhasil ditambahkan', 'success');
      }
      
      fetchRooms();
      setShowModal(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data';
      showAlert('Error', errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/v1/rooms/${id}`);
      showAlert('Berhasil', 'Data kamar berhasil dihapus', 'success');
      fetchRooms();
    } catch (error) {
      showAlert('Error', 'Gagal menghapus kamar', 'error');
    }
  };

  const showAlert = (message, description, type) => {
    setAlert({ show: true, message, description, type });
    setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 3000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Manajemen Kamar Hotel</h1>
        <button
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Tambah Kamar</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Kamar</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gambar</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rooms.map((room, index) => (
                <tr key={room.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{room.hotel?.name || '-'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{room.number}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{room.name}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{room.formatted_price}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <img src={room.image_url} alt={room.name} className="h-10 w-10 rounded object-cover" />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(room)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setAlert({
                          show: true,
                          message: 'Konfirmasi Hapus',
                          description: 'Apakah Anda yakin ingin menghapus kamar ini?',
                          type: 'warning',
                          onConfirm: () => handleDeleteRoom(room.id)
                        });
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl my-8">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedRoom ? 'Edit Kamar' : 'Tambah Kamar Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hotel</label>
                  <select
                    name="hotel_id"
                    value={formData.hotel_id}
                    onChange={(e) => setFormData({ ...formData, hotel_id: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Pilih Hotel</option>
                    {hotels.map((hotel) => (
                      <option key={hotel.id} value={hotel.id}>
                        {hotel.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Nomor Kamar</label>
                  <input
                    type="text"
                    name="number"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Kamar</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Harga Kamar</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Foto Kamar</label>
                <input
                  type="file"
                  name="image"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.type.startsWith('image/')) {
                        setFormData({ ...formData, image: file });
                        setImagePreview(URL.createObjectURL(file));
                      } else {
                        showAlert('Error', 'File harus berupa gambar', 'error');
                      }
                    }
                  }}
                  accept="image/*"
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </form>
            <div className="flex justify-end space-x-4 p-6 border-t">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Menyimpan...
                  </div>
                ) : (
                  'Simpan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {alert.show && (
        <Alert
          message={alert.message}
          description={alert.description}
          type={alert.type}
          onClose={() => setAlert(prev => ({ ...prev, show: false }))}
          onConfirm={alert.onConfirm}
        />
      )}
    </div>
  );
};

export default ManageRoom;
