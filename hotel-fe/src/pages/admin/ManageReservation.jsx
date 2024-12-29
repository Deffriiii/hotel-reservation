import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pencil, Trash2, Plus, X, CreditCard } from 'lucide-react';

// Komponen Alert
const Alert = ({ message, description, type, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="flex flex-col gap-2 text-[10px] sm:text-xs z-50 animate-fade-in">
        <div className="bg-[#232531] rounded-lg shadow-lg w-full max-w-lg mx-auto p-6">
          <div className="flex gap-2 mb-2">
            <div className={`${type === 'success' ? 'text-[#2b9875]' : type === 'error' ? 'text-red-500' : 'text-yellow-500'} bg-white/5 backdrop-blur-xl p-1 rounded-lg`}>
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
            <div className="text-center">
              <p className="text-white text-xl font-semibold mb-2">{message}</p>
              <p className="text-gray-300 text-base">{description}</p>
            </div>
          </div>
          {onConfirm && (
            <div className="flex justify-end space-x-2 w-full">
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
              className="text-gray-600 hover:bg-white/5 p-1 rounded-md transition-colors ease-linear"
            >
              <X className="w-10 h-10" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ManageReservation = () => {
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    user_id: '',
    hotel_id: '',
    room_id: '',
    check_in: '',
    check_out: '',
    guest_count: 1,
    total_price: 0,
    status: 'pending',
    special_requests: ''
  });

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan');
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      let config;
      try {
        config = getAuthConfig();
      } catch (err) {
        setError('Silakan login terlebih dahulu');
        setLoading(false);
        return;
      }

      const [reservationsRes, usersRes, hotelsRes, roomsRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/v1/reservations', config),
        axios.get('http://127.0.0.1:8000/api/v1/user', config),
        axios.get('http://127.0.0.1:8000/api/v1/hotels', config),
        axios.get('http://127.0.0.1:8000/api/v1/rooms', config)
      ]);

      setReservations(Array.isArray(reservationsRes.data) ? reservationsRes.data : reservationsRes.data?.data || []);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : usersRes.data?.data || []);
      setHotels(Array.isArray(hotelsRes.data) ? hotelsRes.data : hotelsRes.data?.data || []);
      setRooms(Array.isArray(roomsRes.data) ? roomsRes.data : roomsRes.data?.data || []);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Gagal memuat data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateTotalPrice = (roomId, checkIn, checkOut, guestCount) => {
    if (!roomId || !checkIn || !checkOut || !guestCount) return 0;
    
    const room = rooms.find((r) => r.id === parseInt(roomId));
    if (!room) return 0;
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    return room.price * guestCount * nights;
  };

  const handleHotelChange = (hotelId) => {
    setFormData({ 
      ...formData, 
      hotel_id: hotelId, 
      room_id: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const totalPrice = calculateTotalPrice(
        formData.room_id,
        formData.check_in,
        formData.check_out,
        parseInt(formData.guest_count)
      );

      const payload = {
        ...formData,
        user_id: parseInt(formData.user_id),
        hotel_id: parseInt(formData.hotel_id),
        room_id: parseInt(formData.room_id),
        guest_count: parseInt(formData.guest_count),
        total_price: totalPrice
      };

      const config = getAuthConfig();

      if (selectedReservation) {
        await axios.put(
          `http://127.0.0.1:8000/api/v1/reservations/${selectedReservation.id}`,
          payload,
          config
        );
        setAlert({
          message: 'Reservasi berhasil diperbarui',
          description: 'Data reservasi telah diperbarui dengan sukses',
          type: 'success'
        });
      } else {
        await axios.post('http://127.0.0.1:8000/api/v1/reservations', payload, config);
        setAlert({
          message: 'Reservasi berhasil dibuat',
          description: 'Data reservasi baru telah ditambahkan',
          type: 'success'
        });
      }

      setShowModal(false);
      fetchData();
      setFormData({
        user_id: '',
        hotel_id: '',
        room_id: '',
        check_in: '',
        check_out: '',
        guest_count: 1,
        total_price: 0,
        status: 'pending',
        special_requests: ''
      });
    } catch (err) {
      console.error('Submit error:', err);
      setAlert({
        message: 'Gagal menyimpan reservasi',
        description: 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.',
        type: 'error'
      });
    }
  };

  const handleDelete = async (id) => {
    setAlert({
      message: "Konfirmasi Hapus",
      description: "Apakah Anda yakin ingin menghapus reservasi ini?",
      type: "warning",
      onConfirm: async () => {
        try {
          const config = getAuthConfig();
          await axios.delete(`http://127.0.0.1:8000/api/v1/reservations/${id}`, config);
          fetchData();
          setAlert({
            message: "Reservasi Berhasil Dihapus",
            description: "Data reservasi telah dihapus dari sistem.",
            type: "success",
          });
        } catch (err) {
          console.error("Error deleting reservation:", err);
          setAlert({
            message: "Gagal Menghapus Reservasi",
            description: "Terjadi kesalahan saat menghapus data. Silakan coba lagi.",
            type: "error",
          });
        }
      },
      onClose: () => setAlert(null),
    });
  };

  const checkPaymentStatus = async (reservationId) => {
    try {
      setCheckingPayment(true);
      setSelectedPaymentId(reservationId);
  
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://127.0.0.1:8000/api/v1/payments/reservation/${reservationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      if (!response.data || !response.data.data) {
        setAlert({
          message: "Belum Ada Pembayaran",
          description: "Tidak ada data pembayaran untuk reservasi ini.",
          type: "info",
        });
        return;
      }
  
      if (response.data.status === "success" && response.data.data.status === "success") {
        setAlert({
          message: "Pembayaran Sukses",
          description: `Pembayaran sukses dari ${response.data.data.user.name} sebesar Rp ${response.data.data.amount.toLocaleString()}.`,
          type: "success",
        });
      } else {
        setAlert({
          message: "Status Pembayaran",
          description: `Status pembayaran saat ini adalah ${response.data.data.status}.`,
          type: "warning",
        });
      }
    } catch (error) {
      console.error("Error checking payment:", error);
      if (error.response && error.response.status === 404) {
        setAlert({
          message: "Belum Ada Pembayaran",
          description: "Tidak ada data pembayaran untuk reservasi ini.",
          type: "info",
        });
      } else {
        setAlert({
          message: "Gagal Mengecek Pembayaran",
          description: "Terjadi kesalahan saat mengecek pembayaran. Silakan coba lagi.",
          type: "error",
        });
      }
    } finally {
      setCheckingPayment(false);
      setSelectedPaymentId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {alert && (
          <Alert
            message={alert.message}
            description={alert.description}
            type={alert.type}
            onClose={() => setAlert(null)}
            onConfirm={alert.onConfirm}
          />
        )}

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">Reservasi</h2>
            <button
              onClick={() => {
                setSelectedReservation(null);
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-black rounded-lg hover:bg-primary-700 transition-colors duration-300 ease-in-out transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              Buat Reservasi
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kamar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cek In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cek Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembayaran</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.user?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.room?.hotel?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.room?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.check_in || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.check_out || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {reservation.status || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => checkPaymentStatus(reservation.id)}
                        disabled={checkingPayment && selectedPaymentId === reservation.id}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-md
                          ${reservation.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800 cursor-default'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                      >
                        <CreditCard className="h-4 w-4" />
                        {checkingPayment && selectedPaymentId === reservation.id
                          ? 'Mengecek...'
                          : reservation.status === 'confirmed'
                          ? 'Terbayar'
                          : 'Cek Pembayaran'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedReservation(reservation);
                            setFormData({
                              ...formData,
                              user_id: reservation.user_id,
                              hotel_id: reservation.room?.hotel?.id,
                              room_id: reservation.room_id,
                              check_in: reservation.check_in,
                              check_out: reservation.check_out,
                              guest_count: reservation.guest_count,
                              status: reservation.status,
                              special_requests: reservation.special_requests,
                            });
                            setShowModal(true);
                          }}
                          className="text-primary-600 hover:text-primary-900 transition-colors duration-300"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(reservation.id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-300"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 p-4 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">{selectedReservation ? 'Edit Reservasi' : 'Buat Reservasi'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="user_id" className="block text-sm font-semibold text-gray-900">Tamu</label>
                <select
                  id="user_id"
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Pilih Tamu</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.username || `User ${user.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="hotel_id" className="block text-sm font-semibold text-gray-900">Hotel</label>
                <select
                  id="hotel_id"
                  value={formData.hotel_id}
                  onChange={(e) => handleHotelChange(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Pilih Hotel</option>
                  {hotels.map((hotel) => (
                    <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="room_id" className="block text-sm font-semibold text-gray-900">Kamar</label>
                <select
                  id="room_id"
                  value={formData.room_id}
                  onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Pilih Kamar</option>
                  {rooms
                    .filter((room) => room.hotel_id === parseInt(formData.hotel_id))
                    .map((room) => (
                      <option key={room.id} value={room.id}>{room.name}</option>
                    ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="check_in" className="block text-sm font-semibold text-gray-900">Cek In</label>
                  <input
                    type="date"
                    id="check_in"
                    value={formData.check_in}
                    onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="check_out" className="block text-sm font-semibold text-gray-900">Cek Out</label>
                  <input
                    type="date"
                    id="check_out"
                    value={formData.check_out}
                    onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="guest_count" className="block text-sm font-semibold text-gray-900">Jumlah Tamu</label>
                <input
                  type="number"
                  id="guest_count"
                  value={formData.guest_count}
                  onChange={(e) => setFormData({ ...formData, guest_count: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  min="1"
                  required
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-gray-900">Status</label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label htmlFor="special_requests" className="block text-sm font-semibold text-gray-900">Permintaan Khusus</label>
                <textarea
                  id="special_requests"
                  value={formData.special_requests}
                  onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  rows="3"
                ></textarea>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors duration-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-black bg-green-300 rounded-lg hover:bg-primary-700 transition-colors duration-300"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReservation;