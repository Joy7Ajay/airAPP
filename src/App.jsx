import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ResetPassword from './pages/ResetPassword';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import Overview from './pages/admin/Overview';
import Analytics from './pages/admin/Analytics';
import AIInsights from './pages/admin/AIInsights';
import Predictions from './pages/admin/Predictions';
import Airports from './pages/admin/Airports';
import Users from './pages/admin/Users';
import Data from './pages/admin/Data';
import Security from './pages/admin/Security';
import Notifications from './pages/admin/Notifications';
import Settings from './pages/admin/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Admin Routes with Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Overview />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="ai-insights" element={<AIInsights />} />
          <Route path="predictions" element={<Predictions />} />
          <Route path="airports" element={<Airports />} />
          <Route path="users" element={<Users />} />
          <Route path="data" element={<Data />} />
          <Route path="security" element={<Security />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
