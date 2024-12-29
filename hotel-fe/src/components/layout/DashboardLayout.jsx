// src/components/layout/DashboardLayout.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Mencegah navigasi back
    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', preventBackButton);

    // Cek jika user sudah login
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { replace: true });
      }
    };

    checkAuth();

    return () => {
      window.removeEventListener('popstate', preventBackButton);
    };
  }, [navigate]);

  const preventBackButton = (e) => {
    window.history.pushState(null, '', window.location.pathname);
  };

  return <div>{children}</div>;
};

export default DashboardLayout;