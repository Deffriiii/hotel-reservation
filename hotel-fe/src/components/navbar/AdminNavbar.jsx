import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { handleLogout } from '../Auth/Login';

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <nav className="bg-black shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo dan Brand */}
          <div className="flex items-center">
            <Link to="/admin/dashboard" className="flex items-center">
              <span className="text-2xl font-bold text-yellow-600">Hotel</span>
              <span className="text-2xl font-bold text-white">Reservation </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/admin/dashboard"
              className="text-white hover:text-yellow-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/managehotels" // Tautan Manage Hotels
              className="text-white hover:text-yellow-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Manage Hotel
            </Link>
            <Link
              to="/admin/managerooms"
              className="text-white hover:text-yellow-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Manage Room
            </Link>
            <Link
              to="/admin/managereservation"
              className="text-white hover:text-yellow-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Manage Reservasi
            </Link>
            <Link
              to="/admin/manageusers"
              className="text-white hover:text-yellow-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Manage Users
            </Link>

            {/* Profile Dropdown */}
            <div className="relative ml-3">
              <div className="flex items-center">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center space-x-2 text-white hover:text-yellow-600 focus:outline-none"
                >
                  <span>{userData.name || 'Admin'}</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Dropdown Menu */}
              {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                  <Link
                    to="/admin/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => handleLogout(navigate)}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-yellow-600 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/admin/dashboard"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-yellow-600 hover:bg-yellow-50"
              >
                Dashboard
              </Link>
              <Link
                to="/admin/managehotels"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-yellow-600 hover:bg-yellow-50"
              >
                Manage Hotel
              </Link>
              <Link
                to="/admin/managerooms"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-yellow-600 hover:bg-yellow-50"
              >
                Manage Room
              </Link>
              <Link
                to="/admin/managereservation"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
              >
                Manage Reservasi
              </Link>
              <Link
                to="/admin/manageusers"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
              >
                Manage Users
              </Link>
              <Link
                to="/profile"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
              >
                Profile
              </Link>
              <button
                onClick={() => handleLogout(navigate)}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;
