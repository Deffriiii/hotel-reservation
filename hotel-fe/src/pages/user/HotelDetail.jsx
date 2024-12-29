import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPinIcon, ArrowLeftIcon, CalendarIcon, UsersIcon, MessageSquareIcon, XIcon } from 'lucide-react';

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [reservationForm, setReservationForm] = useState({
    check_in: '',
    check_out: '',
    guest_count: 1,
    special_requests: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchHotelAndRooms = async () => {
      try {
        const hotelResponse = await axios.get(`http://127.0.0.1:8000/api/v1/hotels/${id}`);
        setHotel(hotelResponse.data.data);

        const roomsResponse = await axios.get('http://127.0.0.1:8000/api/v1/rooms');
        const filteredRooms = roomsResponse.data.data.filter(room => room.hotel_id === parseInt(id));
        setRooms(filteredRooms);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotelAndRooms();
  }, [id]);

  const handleReservationClick = (room) => {
    setSelectedRoom(room);
    setShowReservationModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReservationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitReservation = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Silahkan login terlebih dahulu');
        // Simpan data reservasi ke localStorage sebelum redirect ke login
        localStorage.setItem('pendingReservation', JSON.stringify({
          room_id: selectedRoom.id,
          ...reservationForm
        }));
        navigate('/user/myreservations');
        return;
      }

      const response = await axios.post('http://127.0.0.1:8000/api/v1/reservations', {
        room_id: selectedRoom.id,
        ...reservationForm
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 'success') {
        alert('Reservasi berhasil dibuat!');
        setShowReservationModal(false);
        setReservationForm({
          check_in: '',
          check_out: '',
          guest_count: 1,
          special_requests: '',
        });
        // Mengubah navigasi ke halaman my reservations
        navigate('/user/myreservations');
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      if (error.response?.status === 401) {
        alert('Sesi Anda telah berakhir. Silahkan login kembali.');
        navigate('/user/myreservations');
      } else {
        alert('Terjadi kesalahan saat membuat reservasi');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-gray-600">Hotel tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tombol Kembali */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors duration-300"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Detail Hotel */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-96 overflow-hidden">
          <img
            src={hotel.image_url}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{hotel.name}</h1>
          
          <div className="flex items-start space-x-2 text-gray-600 mb-4">
            <MapPinIcon className="w-5 h-5 mt-1 flex-shrink-0" />
            <p>{hotel.address}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Tentang Hotel</h2>
            <p className="text-gray-600">{hotel.description}</p>
          </div>

          {/* Daftar Kamar */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Kamar Tersedia</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <div 
                  key={room.id} 
                  className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative h-48">
                    <img
                      src={room.image_url}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {room.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      Nomor Kamar: {room.number}
                    </p>
                    <p className="text-gray-600 text-sm mb-4">
                      {room.description}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <span className="text-2xl font-bold text-blue-600">
                        {room.formatted_price}
                      </span>
                      <button 
                        className="w-full sm:w-auto bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300"
                        onClick={() => handleReservationClick(room)}
                      >
                        Pesan Sekarang
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {rooms.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">Tidak ada kamar yang tersedia saat ini.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Form Reservasi */}
      {showReservationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Buat Reservasi - {selectedRoom?.name}
                </h2>
                <button
                  onClick={() => setShowReservationModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitReservation} className="space-y-6">
                {/* Tanggal Check-in */}
                <div>
                  <label className="flex items-center space-x-2 text-gray-700 mb-2">
                    <CalendarIcon className="w-5 h-5" />
                    <span>Tanggal Check-in</span>
                  </label>
                  <input
                    type="date"
                    name="check_in"
                    value={reservationForm.check_in}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                {/* Tanggal Check-out */}
                <div>
                  <label className="flex items-center space-x-2 text-gray-700 mb-2">
                    <CalendarIcon className="w-5 h-5" />
                    <span>Tanggal Check-out</span>
                  </label>
                  <input
                    type="date"
                    name="check_out"
                    value={reservationForm.check_out}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                {/* Jumlah Tamu */}
                <div>
                  <label className="flex items-center space-x-2 text-gray-700 mb-2">
                    <UsersIcon className="w-5 h-5" />
                    <span>Jumlah Tamu</span>
                  </label>
                  <input
                    type="number"
                    name="guest_count"
                    value={reservationForm.guest_count}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                {/* Permintaan Khusus */}
                <div>
                  <label className="flex items-center space-x-2 text-gray-700 mb-2">
                    <MessageSquareIcon className="w-5 h-5" />
                    <span>Permintaan Khusus</span>
                  </label>
                  <textarea
                    name="special_requests"
                    value={reservationForm.special_requests}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Masukkan permintaan khusus Anda (opsional)"
                  />
                </div>

                {/* Tombol Submit */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowReservationModal(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`
                      px-6 py-3 bg-blue-500 text-white rounded-lg
                      hover:bg-blue-600 transition-colors duration-300
                      ${submitting ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {submitting ? 'Memproses...' : 'Buat Reservasi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelDetail;