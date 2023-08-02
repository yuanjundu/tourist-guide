import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App'; 
import Signup from './pages/Signup'; 
import Login from './pages/Login'; 
import EditProfile from "./pages/EditProfile";
import Itinerary from "./pages/Itinerary";
import History from "./pages/History";
import Community from "./pages/Community"
import ResetPassword from "./pages/ResetPassword";
import ResetPasswordConfirm from "./pages/ResetPasswordConfirm";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="register" element={<Signup />} />
      <Route path="login" element={<Login />} />
      <Route path="editprofile" element={<EditProfile />} />
      <Route path="itinerary" element={<Itinerary />} />
      <Route path="history" element={<History />} />
      <Route path="community" element={<Community />} />
      <Route path="resetPassword" element={<ResetPassword />} />
      <Route path="password/reset/:uid/:token" element={<ResetPasswordConfirm />} />
    </Routes>
  );
}
