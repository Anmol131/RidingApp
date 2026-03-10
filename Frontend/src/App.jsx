import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// User Pages
import UserLogin from './user/pages/Login';
import UserRegister from './user/pages/Register';
import UserDashboard from './user/pages/UserDashboard';
import Feedback from './user/pages/Feedback';

// Rider Pages
import RiderLogin from './rider/pages/Login';
import RiderRegister from './rider/pages/Register';
import RiderDashboard from './rider/pages/RiderDashboard';
import RideRequest from './rider/pages/RideRequest';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* User Routes */}
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user/register" element={<UserRegister />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/feedback/:rideId" element={<Feedback />} />
        
        {/* Rider Routes */}
        <Route path="/rider/login" element={<RiderLogin />} />
        <Route path="/rider/register" element={<RiderRegister />} />
        <Route path="/rider/dashboard" element={<RiderDashboard />} />
        <Route path="/rider/ride/:rideId" element={<RideRequest />} />
      </Routes>
    </Router>
  );
}

function Home() {
  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
          Ride Booking System
        </h1>
        <div className="home-links">
          <Link to="/user/login" className="btn">User</Link>
          <Link to="/rider/login" className="btn btn-secondary">Rider</Link>
        </div>
      </div>
    </div>
  );
}

export default App;
