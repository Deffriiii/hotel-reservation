import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layout/DashboardLayout';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    {children}
  </div>
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

const HotelCard = ({ hotel, onShowDetail }) => {
  return (
    <div className="group flex flex-col h-[400px] bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        {/* Gambar Hotel */}
        <img 
          src={hotel.image_url || '/api/placeholder/400/320'}
          alt={hotel.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        {/* Overlay Gradien */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="flex flex-col flex-grow p-4">
        {/* Nama Hotel */}
        <h3 className="font-semibold text-lg mb-2 text-gray-800">{hotel.name}</h3>
        
        {/* Alamat dengan Icon */}
        <div className="flex items-start space-x-2 mb-3">
          <svg className="w-4 h-4 mt-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-gray-600 text-sm flex-grow">{hotel.address}</p>
        </div>
        
        {/* Deskripsi dengan pembatasan baris */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{hotel.description}</p>
        
        {/* Tombol dengan efek hover */}
        <button 
          onClick={() => onShowDetail(hotel.id)}
          className="w-full bg-blue-500 text-white py-2.5 px-4 rounded-lg 
                   transform transition-all duration-300
                   hover:bg-blue-600 hover:shadow-lg 
                   active:scale-95 active:bg-blue-700
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Lihat Detail
        </button>
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

    // Fungsi untuk mendapatkan data user
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token tidak ditemukan. Silahkan login kembali.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const userData = data.data || data;
        
        if (userData) {
          setUserData(userData);
          localStorage.setItem('userId', userData.id);
        } else {
          throw new Error('Format response tidak sesuai');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Gagal mengambil data user: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    // Fungsi untuk mendapatkan data hotel dan reservasi
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
          setError('Token tidak ditemukan. Silahkan login kembali.');
          setLoading(false);
          return;
      }

      try {
          const [hotelsResponse, reservationsResponse] = await Promise.all([
              fetch('http://127.0.0.1:8000/api/v1/hotels', {
                  headers: { 'Accept': 'application/json' }
              }),
              fetch('http://127.0.0.1:8000/api/v1/reservations', {
                  headers: {
                      'Authorization': `Bearer ${token}`,
                      'Accept': 'application/json'
                  }
              })
          ]);

          if (!hotelsResponse.ok || !reservationsResponse.ok) {
              throw new Error('Gagal mengambil data');
          }

          const hotelsData = await hotelsResponse.json();
          const reservationsData = await reservationsResponse.json();

          setHotels(Array.isArray(hotelsData.data) ? hotelsData.data : []);
          setReservations(Array.isArray(reservationsData.data) ? reservationsData.data : []);
      } catch (err) {
          console.error('Error fetching data:', err);
          setError('Terjadi kesalahan saat mengambil data: ' + err.message);
      } finally {
          setLoading(false);
      }
  };

      const handleShowDetail = (hotelId) => {
        navigate(`/user/hoteluser/${hotelId}`);
      };


    // Effect hooks tetap sama
    useEffect(() => {
      fetchUserData();
    }, []);

    useEffect(() => {
      if (userData) {
        fetchData();
      }
    }, [userData]);

    const getStatusColor = (status) => {
      const colors = {
        'pending': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        'confirmed': 'bg-green-100 text-green-800 border border-green-200',
        'cancelled': 'bg-red-100 text-red-800 border border-red-200',
        'completed': 'bg-blue-100 text-blue-800 border border-blue-200'
      };
      return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800 border border-gray-200';
    };

    const formatRupiah = (amount) => {
      if (!amount || amount === 0) return 'Rp.0';
      return `Rp.${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
    };

    if (loading) {
      return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-500 text-center p-6 bg-red-50 rounded-lg max-w-md">
            <svg className="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      );
    }

    return (
      <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section dengan Animasi */}
          <div className="text-center mb-12 transform transition-all duration-500 hover:scale-105">
            <p className="text-xl text-gray-600">
              Selamat datang, {userData?.name || 'Tamu'}
            </p>
          </div>

          {/* Reservasi Section */}
          <Card className="mb-12">
            <h3 className="text-2xl font-semibold mb-6">Reservasi Saya</h3>
            {reservations.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Hotel', 'Check In', 'Check Out', 'Jumlah Tamu', 'Total Harga', 'Status'].map((header) => (
                        <th key={header} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reservations.map((reservation) => (
                      <tr key={reservation.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">{reservation.room?.hotel?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(reservation.check_in).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(reservation.check_out).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{reservation.guest_count}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">Rp {formatRupiah(reservation.total_price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(reservation.status)}`}>
                            {reservation.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                <p className="text-lg">Anda belum memiliki reservasi</p>
                <p className="text-sm mt-2">Mulai menjelajahi hotel-hotel kami di bawah ini</p>
              </div>
            )}
          </Card>

          {/* Daftar Hotel Section */}
          <Card>
            <h3 className="text-2xl font-semibold mb-6">Daftar Hotel</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hotels.map((hotel) => (
                <HotelCard 
                  key={hotel.id} 
                  hotel={hotel} 
                  onShowDetail={() => navigate(`/user/hoteluser/${hotel.id}`)}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
    );
  };

  export default UserDashboard;