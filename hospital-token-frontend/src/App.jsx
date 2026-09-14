import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import HospitalLogin from './pages/HospitalLogin';
import HospitalDashboard from './pages/HospitalDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './components/Toast';

function App() {
  return (
    <ToastProvider>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/Adminlogin" element={<HospitalLogin />} />
          <Route path="/adminlogin" element={<HospitalLogin />} />

          {/* Protected Hospital Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <HospitalDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;

