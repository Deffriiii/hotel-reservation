import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Alert = ({ message, description, type, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-[#232531] rounded-lg shadow-lg w-full max-w-lg mx-auto p-6">
        <div className="flex flex-col items-center justify-between w-full text-center">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className={`${type === 'success' ? 'text-[#2b9875]' : type === 'error' ? 'text-red-500' : 'text-yellow-500'} bg-white/5 backdrop-blur-xl p-3 rounded-lg`}>
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
              <p className="text-white text-xl font-semibold mb-2">{message}</p>
              <p className="text-gray-300 text-base">{description}</p>
            </div>
          </div>
          {onConfirm && (
            <div className="flex justify-center space-x-4 w-full mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-300"
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
          )}
          {!onConfirm && (
            <button
              onClick={onClose}
              className="mt-6 text-gray-400 hover:text-gray-200 hover:bg-white/5 p-2 rounded-full transition-colors ease-linear"
            >
              <X className="w-8 h-8" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ManageHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    description: '',
    type: 'success'
  });

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/v1/hotels');
      setHotels(response.data.data);
      setLoading(false);
    } catch (err) {
      setAlert({ show: true, message: 'Gagal mengambil data hotel', description: 'Terjadi kesalahan saat mengambil data hotel.', type: 'error' });
      setLoading(false);
      setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 5000);
    }
  };

  const handleOpenModal = (hotel = null) => {
    if (hotel) {
      setSelectedHotel(hotel);
      setFormData({
        name: hotel.name,
        address: hotel.address,
        description: hotel.description,
        image: null
      });
      setImagePreview(hotel.image_url);
    } else {
      setSelectedHotel(null);
      setFormData({
        name: '',
        address: '',
        description: '',
        image: null
      });
      setImagePreview(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedHotel(null);
    setFormData({
      name: '',
      address: '',
      description: '',
      image: null
    });
    setImagePreview(null);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      if (e.target.files && e.target.files[0]) {
        setFormData({ ...formData, image: e.target.files[0] });
        setImagePreview(URL.createObjectURL(e.target.files[0]));
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('description', formData.description);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (selectedHotel) {
        formDataToSend.append('_method', 'PUT');
        await axios.post(`http://127.0.0.1:8000/api/v1/hotels/${selectedHotel.id}`, formDataToSend);
        setAlert({ show: true, message: 'Hotel berhasil diperbarui', description: 'Data hotel telah berhasil diperbarui.', type: 'success' });
      } else {
        await axios.post('http://127.0.0.1:8000/api/v1/hotels', formDataToSend);
        setAlert({ show: true, message: 'Hotel berhasil ditambahkan', description: 'Hotel baru telah berhasil ditambahkan.', type: 'success' });
      }
      
      fetchHotels();
      handleCloseModal();
    } catch (error) {
      setAlert({
        show: true,
        message: selectedHotel ? 'Gagal memperbarui hotel' : 'Gagal menambahkan hotel',
        description: 'Terjadi kesalahan saat menyimpan data hotel.',
        type: 'error'
      });
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 5000);
    }
  };

  const deleteHotel = (id) => {
    setAlert({
      show: true,
      message: 'Konfirmasi Penghapusan',
      description: 'Apakah Anda yakin ingin menghapus hotel ini?',
      type: 'warning',
      onConfirm: async () => {
        try {
          await axios.delete(`http://127.0.0.1:8000/api/v1/hotels/${id}`);
          setAlert({
            show: true,
            message: 'Hotel berhasil dihapus',
            description: 'Data hotel telah berhasil dihapus.',
            type: 'success'
          });
          fetchHotels();
        } catch (err) {
          setAlert({
            show: true,
            message: 'Gagal menghapus hotel',
            description: 'Terjadi kesalahan saat menghapus data hotel.',
            type: 'error'
          });
        }
        setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 5000);
      }
    });
  };


  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daftar Hotel</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-300 transform hover:scale-105"
        >
          Tambah Hotel
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105">
            <img
              src={hotel.image_url || '/placeholder-hotel.jpg'}
              alt={hotel.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 flex flex-col h-[calc(100%-12rem)]">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">{hotel.name}</h2>
              <p className="text-gray-600 text-sm mb-2">{hotel.address}</p>
              <p className="text-gray-500 text-sm mb-4 flex-grow overflow-hidden">
                {hotel.description}
              </p>
              <div className="flex justify-end space-x-2 mt-auto">
                <button
                  onClick={() => handleOpenModal(hotel)}
                  className="p-2 text-blue-500 hover:bg-blue-100 rounded transition-colors duration-300 transform hover:scale-110"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => deleteHotel(hotel.id)}
                  className="p-2 text-red-500 hover:bg-red-100 rounded transition-colors duration-300 transform hover:scale-110"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-40 animate-fade-in">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {selectedHotel ? 'Edit Hotel' : 'Tambah Hotel Baru'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-300 transform hover:scale-110"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Hotel
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gambar Hotel
                  </label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleChange}
                    accept="image/*"
                    className="w-full"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mt-2 h-40 object-cover rounded-md"
                    />
                  )}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-300 transform hover:scale-105"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition-colors duration-300 transform hover:scale-105"
                  >
                    {loading ? 'Menyimpan...' : selectedHotel ? 'Perbarui' : 'Simpan'}
                  </button>
                </div>
              </form>
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

export default ManageHotels;