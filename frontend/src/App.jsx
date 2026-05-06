import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './pages/Register';

// ⬇️ We'll import more pages here as we build them
import Login from './pages/Login';
// import OTPVerify from './pages/OTPVerify';
// import Dashboard from './pages/Dashboard';
// import Leads from './pages/Leads';
// import LeadDetail from './pages/LeadDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — no login needed */}
        <Route path="/register" element={<Register />} />

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected routes will go here */}
        <Route path="/login" element={<Login />} />
        {/* <Route path="/verify-otp" element={<OTPVerify />} /> */}
        {/* <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> */}
        {/* <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} /> */}
        {/* <Route path="/leads/:id" element={<ProtectedRoute><LeadDetail /></ProtectedRoute>} /> */}

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
