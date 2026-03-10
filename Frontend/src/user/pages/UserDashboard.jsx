import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { rideAPI } from '../services/api';

const socket = io('http://localhost:5000');

function UserDashboard() {
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [currentRide, setCurrentRide] = useState(null);
  const [rideLocations, setRideLocations] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem('userName');
    const id = localStorage.getItem('userId');
    
    if (!name || !id) {
      navigate('/user/login');
      return;
    }
    
    setUserName(name);
    setUserId(id);

    // Socket listeners
    socket.on('ride booked', (ride) => {
      setCurrentRide(ride);
      setLoading(false);
    });

    socket.on('ride accepted', (ride) => {
      if (ride._id === currentRide?._id) {
        setCurrentRide(ride);
      }
    });

    socket.on('location update', (data) => {
      if (data.rideId === currentRide?._id) {
        console.log('Rider location:', data.location);
      }
    });

    socket.on('ride ended', (ride) => {
      if (ride._id === currentRide?._id) {
        setCurrentRide(ride);
        // Redirect to feedback after 2 seconds
        setTimeout(() => {
          navigate(`/user/feedback/${ride._id}`);
        }, 2000);
      }
    });

    socket.on('ride cancelled', (ride) => {
      if (ride._id === currentRide?._id) {
        setCurrentRide(null);
        alert('Ride has been cancelled');
      }
    });

    return () => {
      socket.off('ride booked');
      socket.off('ride accepted');
      socket.off('location update');
      socket.off('ride ended');
      socket.off('ride cancelled');
    };
  }, [navigate, currentRide]);

  const getRandomLocation = async () => {
    try {
      const response = await rideAPI.getRandomLocations();
      setRideLocations(response.data);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const bookRide = async () => {
    if (!rideLocations) {
      await getRandomLocation();
      return;
    }

    setLoading(true);
    const rideData = {
      userId,
      pickupLocation: rideLocations.pickup,
      dropoffLocation: rideLocations.dropoff,
      fare: rideLocations.estimatedFare,
      distance: rideLocations.distance,
    };

    // Emit via socket
    socket.emit('book ride', rideData);
  };

  const cancelRide = () => {
    if (currentRide && currentRide.status !== 'completed') {
      socket.emit('cancel ride', currentRide._id);
      setCurrentRide(null);
      setRideLocations(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    navigate('/user/login');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome, {userName}!</h2>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="container">
        {!currentRide ? (
          <div className="card">
            <h3>Book a Ride</h3>
            {!rideLocations ? (
              <button onClick={getRandomLocation} className="btn">
                Get Random Location
              </button>
            ) : (
              <>
                <div className="location-info">
                  <strong>Pickup:</strong> {rideLocations.pickup.address}
                  <br />
                  <small>
                    ({rideLocations.pickup.lat}, {rideLocations.pickup.lng})
                  </small>
                </div>
                <div className="location-info">
                  <strong>Dropoff:</strong> {rideLocations.dropoff.address}
                  <br />
                  <small>
                    ({rideLocations.dropoff.lat}, {rideLocations.dropoff.lng})
                  </small>
                </div>
                <div className="location-info">
                  <strong>Distance:</strong> {rideLocations.distance} km
                  <br />
                  <strong>Estimated Fare:</strong> Rs. {rideLocations.estimatedFare}
                </div>
                <button
                  onClick={bookRide}
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? 'Booking...' : 'Book Ride'}
                </button>
                <button
                  onClick={() => setRideLocations(null)}
                  className="btn btn-secondary"
                  style={{ marginTop: '10px' }}
                >
                  Change Location
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="card">
            <h3>Current Ride</h3>
            <div className="location-info">
              <span className={`ride-status status-${currentRide.status}`}>
                {currentRide.status.toUpperCase()}
              </span>
            </div>
            <div className="location-info">
              <strong>Pickup:</strong> {currentRide.pickupLocation.address}
            </div>
            <div className="location-info">
              <strong>Dropoff:</strong> {currentRide.dropoffLocation.address}
            </div>
            <div className="location-info">
              <strong>Distance:</strong> {currentRide.distance} km
              <br />
              <strong>Fare:</strong> Rs. {currentRide.fare}
            </div>
            {currentRide.riderId && (
              <div className="location-info">
                <strong>Rider:</strong> {currentRide.riderId.name}
                <br />
                <strong>Vehicle:</strong> {currentRide.riderId.vehicleType} (
                {currentRide.riderId.vehicleNumber})
                <br />
                <strong>Rating:</strong> ⭐ {currentRide.riderId.rating}
              </div>
            )}
            {currentRide.status !== 'completed' &&
              currentRide.status !== 'cancelled' && (
                <button onClick={cancelRide} className="btn btn-danger">
                  Cancel Ride
                </button>
              )}
            {currentRide.status === 'completed' && (
              <button
                onClick={() => navigate(`/user/feedback/${currentRide._id}`)}
                className="btn"
              >
                Give Feedback
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
