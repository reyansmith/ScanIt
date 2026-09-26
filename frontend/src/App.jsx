import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileSetup from './pages/ProfileSetup';
import Home from './pages/Home';
import SmartShopping from './pages/SmartShopping';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import ScanHistory from './pages/ScanHistory';
import PersonalAI from './pages/PersonalAI';
import Community from './pages/Community';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/shopping" element={<SmartShopping />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/history" element={<ScanHistory />} />
        <Route path="/health" element={<ProfileSetup />} />
        <Route path="/profile-setup" element={<Navigate to="/health" replace />} />
        <Route path="/ai" element={<PersonalAI />} />
        <Route path="/community" element={<Community />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
