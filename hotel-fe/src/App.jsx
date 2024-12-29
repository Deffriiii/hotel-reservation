import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login, Register, Profile } from './components/Auth';
import AdminDashboard from './components/Dashboard/Admin/AdminDashboard';
import UserDashboard from './components/Dashboard/User/UserDashboard';
import AdminNavbar from './components/navbar/AdminNavbar';
import UserNavbar from './components/navbar/UserNavbar';
import ManageHotels from './pages/admin/ManageHotels';
import ManageUsers from './pages/admin/ManageUser';
import ManageRooms from './pages/admin/ManageRoom';
import ManageReservation from './pages/admin/ManageReservation';
import HotelUser from './pages/user/HotelUser';
import HotelDetail from './pages/user/HotelDetail';
import MyReservation from './pages/user/MyReservation';
import { Toaster } from 'react-hot-toast';


// Proteksi Rute untuk Authenticated User
const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute role="admin">
              <AdminNavbar />
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/managehotels"
          element={
            <PrivateRoute role="admin">
              <AdminNavbar />
              <ManageHotels />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/managerooms"
          element={
            <PrivateRoute role="admin">
              <AdminNavbar />
              <ManageRooms />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/managereservation"
          element={
            <PrivateRoute role="admin">
              <AdminNavbar />
              <ManageReservation />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/manageusers"
          element={
            <PrivateRoute role="admin">
              <AdminNavbar />
              <ManageUsers />
            </PrivateRoute>
          }
        />
         <Route
          path="/admin/profile"
          element={
            <PrivateRoute role="admin">
              <AdminNavbar />
              <Profile />
            </PrivateRoute>
          }
        />

        {/* User Routes */}
        <Route
          path="/user/dashboard"
          element={
            <PrivateRoute role="user">
              <UserNavbar />
              <UserDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/user/hoteluser"
          element={
            <PrivateRoute role="user">
              <UserNavbar />
              <HotelUser />
            </PrivateRoute>
          }
        />
        <Route
          path="/user/myreservations"
          element={
            <PrivateRoute role="user">
              <UserNavbar />
              <MyReservation />
            </PrivateRoute>
          }
        />
        <Route
          path="/user/hoteluser/:id"
          element={
            <PrivateRoute role="user">
              <UserNavbar />
              <HotelDetail />
            </PrivateRoute>
          }
        />
        

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
