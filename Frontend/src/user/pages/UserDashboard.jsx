import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { rideAPI, locationAPI } from '../services/api';

const socket = io('http://localhost:5000');

function UserDashboard() {
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [currentRide, setCurrentRide] = useState(null);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [selectedPickup, setSelectedPickup] = useState('');
  const [selectedDropoff, setSelectedDropoff] = useState('');
  const [fareInfo, setFareInfo] = useState(null);
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

    // Fetch all available locations
    fetchLocations();

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

  const fetchLocations = async () => {
    try {
      const response = await locationAPI.getAllLocations();
      setAvailableLocations(response.data.locations);
    } catch (error) {
      console.error('Error fetching locations:', error);
      // If no locations found, try to seed them
      if (error.response?.status === 404) {
        try {
          await locationAPI.seedLocations();
          const retryResponse = await locationAPI.getAllLocations();
          setAvailableLocations(retryResponse.data.locations);
        } catch (seedError) {
          console.error('Error seeding locations:', seedError);
        }
      }
    }
  };

  // Calculate fare when both locations are selected
  useEffect(() => {
    const calculateFareInfo = async () => {
      if (selectedPickup && selectedDropoff && selectedPickup !== selectedDropoff) {
        try {
          const response = await locationAPI.calculateFare(selectedPickup, selectedDropoff);
          setFareInfo(response.data);
        } catch (error) {
          console.error('Error calculating fare:', error);
          setFareInfo(null);
        }
      } else {
        setFareInfo(null);
      }
    };

    calculateFareInfo();
  }, [selectedPickup, selectedDropoff]);

  const cancelRide = () => {
    if (currentRide && currentRide.status !== 'completed') {
      socket.emit('cancel ride', currentRide._id);
      setCurrentRide(null);
      setSelectedPickup('');
      setSelectedDropoff('');
      setFareInfo(null);
    }
  };

  const handleBookRide = () => {
    if (!fareInfo) return;

    setLoading(true);
    const rideData = {
      userId,
      pickupLocation: fareInfo.pickup,
      dropoffLocation: fareInfo.dropoff,
      fare: fareInfo.fare,
      distance: fareInfo.distance,
    };

    // Emit via socket
    socket.emit('book ride', rideData);
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
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Pickup Location:
              </label>
              <select
                value={selectedPickup}
                onChange={(e) => setSelectedPickup(e.target.value)}
                className="location-select"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '5px',
                  border: '1px solid #ddd'
                }}
              >
                <option value="">Select Pickup Location</option>
                {availableLocations.map((location) => (
                  <option key={location._id} value={location._id}>
                    {location.address}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Drop Location:
              </label>
              <select
                value={selectedDropoff}
                onChange={(e) => setSelectedDropoff(e.target.value)}
                className="location-select"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '5px',
                  border: '1px solid #ddd'
                }}
              >
                <option value="">Select Drop Location</option>
                {availableLocations.map((location) => (
                  <option 
                    key={location._id} 
                    value={location._id}
                    disabled={location._id === selectedPickup}
                  >
                    {location.address}
                  </option>
                ))}
              </select>
            </div>

            {fareInfo && (
              <>
                <div className="location-info" style={{ 
                  backgroundColor: '#f0f8ff', 
                  padding: '15px', 
                  borderRadius: '5px',
                  marginBottom: '15px' 
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Distance:</strong> {fareInfo.distance} km
                  </div>
                  <div style={{ fontSize: '20px', color: '#2563eb', fontWeight: 'bold' }}>
                    <strong>Fare:</strong> Rs. {fareInfo.fare}
                  </div>
                </div>
                <button
                  onClick={handleBookRide}
                  className="btn btn-success"
                  disabled={loading}
                  style={{ width: '100%' }}
                >
                  {loading ? 'Booking...' : 'Book Ride'}
                </button>
              </>
            )}

            {selectedPickup && selectedDropoff && selectedPickup === selectedDropoff && (
              <div style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>
                Pickup and drop locations must be different
              </div>
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
