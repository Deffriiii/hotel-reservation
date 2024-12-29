import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, 
  UserIcon, 
  CreditCardIcon, 
  ClockIcon, 
  BuildingIcon,
  CheckIcon,
  XIcon,
  MessageSquareIcon,
  TrashIcon,
  AlertCircleIcon
} from 'lucide-react';
import Payment from './Payment';

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingReservation, setDeletingReservation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token);
      if (!token) {
        navigate('/login');
      }


      const response = await axios.get('http://127.0.0.1:8000/api/v1/reservations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.status === 'success') {
        setReservations(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://127.0.0.1:8000/api/v1/reservations/${selectedReservation.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.status === 'success') {
        setReservations(prevReservations =>
          prevReservations.map(reservation =>
            reservation.id === selectedReservation.id
              ? { ...reservation, ...response.data.data }
              : reservation
          )
        );
      }

      setShowPayment(false);
    } catch (error) {
      console.error('Error updating reservation:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: <ClockIcon className="w-4 h-4" />
      },
      confirmed: {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
        icon: <CheckIcon className="w-4 h-4" />
      },
      cancelled: {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        icon: <XIcon className="w-4 h-4" />
      }
    };

    const badge = badges[status] || badges.pending;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full 
        font-medium ${badge.bg} ${badge.text} ${badge.border} border`}
      >
        {badge.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Fungsi untuk menghapus reservasi
  const handleDeleteReservation = async (reservationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://127.0.0.1:8000/api/v1/reservations/${reservationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.status === 'success') {
        // Update state untuk menghapus reservasi dari daftar
        setReservations(prevReservations => 
          prevReservations.filter(reservation => reservation.id !== reservationId)
        );
        alert('Reservasi berhasil dihapus');
      }
    } catch (error) {
      console.error('Error deleting reservation:', error);
      alert('Gagal menghapus reservasi');
    } finally {
      setShowDeleteConfirm(false);
      setDeletingReservation(null);
    }
  };

  // Modal konfirmasi hapus
  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center space-x-3 text-red-600 mb-4">
          <AlertCircleIcon className="w-6 h-6" />
          <h3 className="text-lg font-semibold">Konfirmasi Hapus</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Apakah Anda yakin ingin menghapus reservasi ini? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            Batal
          </button>
          <button
            onClick={() => handleDeleteReservation(deletingReservation)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Hapus Reservasi
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Reservasi Saya</h1>
            <button 
              onClick={() => navigate('/')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <BuildingIcon className="w-5 h-5 mr-2" />
              Cari Hotel
            </button>
          </div>

          {/* Reservasi Cards */}
          {reservations.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <div className="max-w-md mx-auto">
                <BuildingIcon className="w-12 h-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Belum ada reservasi</h3>
                <p className="mt-2 text-gray-500">Mulai mencari hotel untuk liburan Anda</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition">
                  <div className="p-6">
                    {/* Header Reservasi */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">
                          {reservation.room.hotel.name}
                        </h2>
                        <p className="text-gray-600">
                          {reservation.room.name} - Kamar {reservation.room.number}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(reservation.status)}
                        {reservation.status === 'pending' && (
                          <button
                            onClick={() => {
                              setDeletingReservation(reservation.id);
                              setShowDeleteConfirm(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Hapus Reservasi"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Informasi Detail */}
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Tanggal */}
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <CalendarIcon className="w-5 h-5 text-blue-500 mt-1" />
                          <div>
                            <p className="font-medium text-gray-700">Check-in</p>
                            <p className="text-gray-600">{formatDate(reservation.check_in)}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CalendarIcon className="w-5 h-5 text-blue-500 mt-1" />
                          <div>
                            <p className="font-medium text-gray-700">Check-out</p>
                            <p className="text-gray-600">{formatDate(reservation.check_out)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Detail Tamu & Permintaan */}
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <UserIcon className="w-5 h-5 text-blue-500 mt-1" />
                          <div>
                            <p className="font-medium text-gray-700">Jumlah Tamu</p>
                            <p className="text-gray-600">{reservation.guest_count} orang</p>
                          </div>
                        </div>
                        {reservation.special_requests && (
                          <div className="flex items-start space-x-3">
                            <MessageSquareIcon className="w-5 h-5 text-blue-500 mt-1" />
                            <div>
                              <p className="font-medium text-gray-700">Permintaan Khusus</p>
                              <p className="text-gray-600">{reservation.special_requests}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Pembayaran */}
                      <div className="flex flex-col justify-between">
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Total Pembayaran</p>
                          <p className="text-2xl font-bold text-blue-600">
                            Rp {parseFloat(reservation.total_price).toLocaleString('id-ID')}
                          </p>
                        </div>
                        
                        {reservation.status === 'pending' && (
                          <button
                            onClick={() => {
                              setSelectedReservation(reservation);
                              setShowPayment(true);
                            }}
                            className="mt-4 inline-flex items-center justify-center px-4 py-2.5 
                              bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                              transition-colors duration-300 group"
                          >
                            <CreditCardIcon className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                            Bayar Sekarang
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && selectedReservation && (
        <Payment
          reservationId={selectedReservation.id}
          totalAmount={selectedReservation.total_price}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
      {showDeleteConfirm && <DeleteConfirmationModal />}
    </div>
  );
};

export default MyReservations;