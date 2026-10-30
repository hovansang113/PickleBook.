import { Routes, Route, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import HomePage from './page/HomePage'
import CourtsPage from './page/CourtsPage'
import CourtDetailPage from './page/CourtDetailPage'
import CheckoutPage from './page/CheckoutPage'
import PaymentResultPage from './page/PaymentResultPage'
import MyBookingsPage from './page/MyBookingsPage'
import RewardsPage from './page/RewardsPage'
import AboutPage from './page/AboutPage'
import LoginPage from './page/LoginPage'
import RegisterPage from './page/RegisterPage'
import AdminPage from './page/AdminPage'
import AdminCourtsPage from './page/AdminCourtsPage'
import AdminBookingsPage from './page/AdminBookingsPage'
import Footer from './components/Footer'
import Header from './components/Header'
import './App.css'

function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div className="flex min-h-svh flex-col">
      <ToastContainer position="top-center" autoClose={3000} />
      {!isAdminRoute && <Header />}
      <main className="min-h-0 flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courts" element={<CourtsPage />} />
          <Route path="/courts/:id" element={<CourtDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment/result" element={<PaymentResultPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/rewards" element={<RewardsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/courts" element={<AdminCourtsPage />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  )
}

export default App
