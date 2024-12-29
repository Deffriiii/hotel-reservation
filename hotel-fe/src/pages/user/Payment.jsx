import React, { useState } from 'react';
import axios from 'axios';
import { XCircleIcon } from 'lucide-react';

const Payment = ({ reservationId, totalAmount, onClose, onSuccess }) => {
    const [paymentMethod, setPaymentMethod] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('token');
        
        // 1. Buat payment baru
        const paymentResponse = await axios.post(
          'http://127.0.0.1:8000/api/v1/payments',
          {
            reservation_id: reservationId,
            user_id: JSON.parse(localStorage.getItem('user')).id,
            amount: totalAmount,
            payment_method: paymentMethod,
            status: 'pending', // Ubah status awal menjadi pending
            transaction_id: 'TRX' + Date.now(),
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
  
        if (paymentResponse.data) {
          // 2. Cek status pembayaran
          const paymentId = paymentResponse.data.id;
          let attempts = 0;
          const maxAttempts = 3;
          
          const checkPaymentStatus = async () => {
            if (attempts >= maxAttempts) {
              setError('Timeout: Pembayaran membutuhkan waktu lebih lama dari biasanya');
              setLoading(false);
              return;
            }
  
            try {
              const statusResponse = await axios.get(
                `http://127.0.0.1:8000/api/v1/payments/${paymentId}`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                }
              );
  
              if (statusResponse.data.status === 'success') {
                // 3. Update reservation status
                await axios.put(
                  `http://127.0.0.1:8000/api/v1/reservations/${reservationId}`,
                  { status: 'confirmed' },
                  {
                    headers: {
                      'Authorization': `Bearer ${token}`
                    }
                  }
                );
                
                onSuccess(statusResponse.data);
              } else if (statusResponse.data.status === 'pending') {
                attempts++;
                setTimeout(checkPaymentStatus, 2000); // Cek lagi setelah 2 detik
              } else {
                setError('Pembayaran gagal: ' + statusResponse.data.message);
                setLoading(false);
              }
            } catch (error) {
              setError('Gagal mengecek status pembayaran');
              setLoading(false);
            }
          };
  
          // Mulai pengecekan status
          checkPaymentStatus();
        }
      } catch (error) {
        console.error('Payment error:', error);
        setError(error.response?.data?.message || 'Terjadi kesalahan saat memproses pembayaran');
        setLoading(false);
      }
    };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <XCircleIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Pembayaran</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <p className="text-lg font-semibold text-gray-800 mb-2">Total Pembayaran</p>
            <p className="text-2xl font-bold text-blue-600">
              Rp {parseFloat(totalAmount).toLocaleString('id-ID')}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Metode Pembayaran
            </label>
            <div className="space-y-2">
              {['bank_transfer', 'credit_card', 'cash'].map((method) => (
                <label
                  key={method}
                  className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-700 capitalize">
                    {method.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!paymentMethod || loading}
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold
              ${loading || !paymentMethod
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </span>
            ) : (
              'Bayar Sekarang'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Payment;