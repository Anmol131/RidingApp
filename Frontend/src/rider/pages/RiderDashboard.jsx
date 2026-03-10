import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { riderAPI } from '../services/api';

const socket = io('http://localhost:5000');

function RiderDashboard() {
  const [riderName, setRiderName] = useState('');
  const [riderId, setRiderId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [availableRides, setAvailableRides] = useState([]);
  const [currentRide, setCurrentRide] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem('riderName');
    const id = localStorage.getItem('riderId');
    
    if (!name || !id) {
      navigate('/rider/login');
      return;
    }
    
    setRiderName(name);
    setRiderId(id);

    // Set rider as active
    socket.emit('rider status', { riderId: id, isActive: true });

    // Socket listeners
    socket.on('new ride request', (ride) => {
      if (ride.status === 'pending' && !currentRide) {
        setAvailableRides((prev) => {
          const exists = prev.find((r) => r._id === ride._id);
          if (exists) return prev;
          return [ride, ...prev];
        });
      }
    });

    socket.on('ride accepted', (ride) => {
      if (ride.riderId?._id === id) {
        setCurrentRide(ride);
        setAvailableRides([]);
      } else {
        // Remove accepted ride from available list
        setAvailableRides((prev) => prev.filter((r) => r._id !== ride._id));
      }
    });

    socket.on('ride cancelled', (ride) => {
      if (currentRide && ride._id === currentRide._id) {
        setCurrentRide(null);
        alert('Ride was cancelled by user');
      }
      setAvailableRides((prev) => prev.filter((r) => r._id !== ride._id));
    });

    return () => {
      socket.off('new ride request');
      socket.off('ride accepted');
      socket.off('ride cancelled');
      // Set rider as inactive on unmount
      socket.emit('rider status', { riderId: id, isActive: false });
    };
  }, [navigate, currentRide, riderId]);

  const acceptRide = async (rideId) => {
    try {
      socket.emit('accept ride', { rideId, riderId });
    } catch (error) {
      console.error('Error accepting ride:', error);
    }
  };

  const toggleStatus = () => {
    const newStatus = !isActive;
    setIsActive(newStatus);
    socket.emit('rider status', { riderId, isActive: newStatus });
    if (newStatus) {
      alert('You are now online');
    } else {
      alert('You are now offline');
    }
  };

  const handleLogout = () => {
    socket.emit('rider status', { riderId, isActive: false });
    localStorage.removeItem('riderToken');
    localStorage.removeItem('riderId');
    localStorage.removeItem('riderName');
    navigate('/rider/login');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome, {riderName}!</h2>
        <div>
          <button
            onClick={toggleStatus}
            className={`btn ${isActive ? 'btn-success' : 'btn-secondary'}`}
            style={{ marginRight: '10px' }}
          >
            {isActive ? 'Online' : 'Offline'}
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="container">
        {currentRide ? (
          <div className="card">
            <h3>Active Ride</h3>
            <div className="location-info">
              <span className={`ride-status status-${currentRide.status}`}>
                {currentRide.status.toUpperCase()}
              </span>
            </div>
            <button
              onClick={() => navigate(`/rider/ride/${currentRide._id}`)}
              className="btn"
            >
              Manage Ride
            </button>
          </div>
        ) : (
          <div className="card">
            <h3>Available Rides</h3>
            {!isActive ? (
              <p>You are offline. Go online to see available rides.</p>
            ) : availableRides.length === 0 ? (
              <p>Waiting for ride requests...</p>
            ) : (
              <ul className="ride-list">
                {availableRides.map((ride) => (
                  <li key={ride._id} className="ride-item">
                    <div>
                      <strong>Pickup:</strong> {ride.pickupLocation.address}
                      <br />
                      <strong>Dropoff:</strong> {ride.dropoffLocation.address}
                      <br />
                      <strong>Distance:</strong> {ride.distance} km
                      <br />
                      <strong>Fare:</strong> Rs. {ride.fare}
                    </div>
                    <button
                      onClick={() => acceptRide(ride._id)}
                      className="btn btn-success"
                      style={{ marginTop: '10px' }}
                    >
                      Accept Ride
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RiderDashboard;
