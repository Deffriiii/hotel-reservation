import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPinIcon, Search, Hotel, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
    <Loader className="w-12 h-12 animate-spin text-blue-500" />
    <p className="text-gray-600">Memuat data hotel...</p>
  </div>
);

const HotelCard = ({ hotel, onShowDetail }) => (
  <div className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-[500px]">
    {/* Area Gambar - Tinggi tetap */}
    <div className="relative h-48 overflow-hidden">
      <img
        src={hotel.image_url || '/placeholder-hotel.jpg'}
        alt={hotel.name}
        className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
    
    {/* Konten - Flex grow untuk mengisi ruang */}
    <div className="flex flex-col flex-grow p-6">
      {/* Wrapper untuk konten yang bisa scroll jika terlalu panjang */}
      <div className="flex-grow overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-300">
          {hotel.name}
        </h2>
        
        <div className="flex items-start space-x-2 text-gray-600 mb-4">
          <MapPinIcon className="w-5 h-5 mt-1 flex-shrink-0 text-blue-500" />
          <p className="text-sm">{hotel.address}</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm line-clamp-3">
            {hotel.description}
          </p>
        </div>
      </div>
      
      {/* Tombol - Selalu di bagian bawah */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <button 
          onClick={() => onShowDetail(hotel.id)}
          className="w-full bg-blue-500 text-white py-3 rounded-lg
                   transform transition-all duration-300
                   hover:bg-blue-600 hover:shadow-lg
                   active:scale-95
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                   flex items-center justify-center space-x-2"
        >
          <span>Lihat Detail</span>
          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" 
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
);

const HotelUser = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHotels, setFilteredHotels] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    const filtered = hotels.filter(hotel =>
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredHotels(filtered);
  }, [searchTerm, hotels]);

  const fetchHotels = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/v1/hotels');
      setHotels(response.data.data);
      setFilteredHotels(response.data.data);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12 transform transition-all duration-500 hover:scale-105">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Temukan Hotel Impian Anda
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Jelajahi berbagai pilihan hotel terbaik untuk kenyamanan perjalanan Anda
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
            <input
              type="text"
              placeholder="Cari hotel berdasarkan nama atau lokasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 
                       focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 
                       transition-all duration-300
                       text-gray-800 placeholder-gray-400
                       shadow-sm hover:shadow-md"
            />
          </div>
        </div>

        {/* Grid Hotel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredHotels.map((hotel) => (
            <HotelCard 
              key={hotel.id}
              hotel={hotel}
              onShowDetail={() => navigate(`/user/hoteluser/${hotel.id}`)}
            />
          ))}
        </div>

        {/* Pesan Tidak Ada Hasil */}
        {filteredHotels.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm mt-8">
            <Hotel className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-xl mb-2">
              Tidak ada hotel yang sesuai dengan pencarian Anda.
            </p>
            <p className="text-gray-400">
              Coba gunakan kata kunci yang berbeda
            </p>
          </div>
        )}
      </div>
    </div>
  );
};


export default HotelUser;