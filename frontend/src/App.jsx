import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import Community from './pages/Community';

function PrivateRoute({ children }) {
  const token = useStore((s) => s.token);
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* Public alias */ }
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile-setup" element={<PrivateRoute><ProfileSetup /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/scanner" element={<PrivateRoute><Scanner /></PrivateRoute>} />
        <Route path="/community" element={<PrivateRoute><Community /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
