import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { rideAPI } from '../services/api';

const socket = io('http://localhost:5000');

function RideRequest() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [riderId, setRiderId] = useState('');
  const [location, setLocation] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    const id = localStorage.getItem('riderId');
    if (!id) {
      navigate('/rider/login');
      return;
    }
    setRiderId(id);
    loadRide();

    socket.on('ride cancelled', (cancelledRide) => {
      if (cancelledRide._id === rideId) {
        alert('Ride was cancelled by user');
        navigate('/rider/dashboard');
      }
    });

    return () => {
      socket.off('ride cancelled');
    };
  }, [rideId, navigate]);

  const loadRide = async () => {
    try {
      const response = await rideAPI.getRide(rideId);
      setRide(response.data);
      if (response.data.pickupLocation) {
        setLocation({
          lat: response.data.pickupLocation.lat,
          lng: response.data.pickupLocation.lng,
        });
      }
    } catch (error) {
      console.error('Error loading ride:', error);
    }
  };

  const updateLocation = () => {
    // Simulate location change (move slightly)
    const newLocation = {
      lat: location.lat + (Math.random() - 0.5) * 0.01,
      lng: location.lng + (Math.random() - 0.5) * 0.01,
    };
    setLocation(newLocation);
    
    socket.emit('rider location', {
      riderId,
      rideId,
      location: newLocation,
    });
  };

  const startRide = async () => {
    try {
      await rideAPI.updateRide(rideId, { status: 'in-progress' });
      loadRide();
      // Start sending location updates
      alert('Ride started! Location updates will be sent.');
    } catch (error) {
      console.error('Error starting ride:', error);
    }
  };

  const endRide = async () => {
    try {
      socket.emit('end ride', {
        rideId,
        fare: ride.fare,
      });
      alert('Ride completed!');
      navigate('/rider/dashboard');
    } catch (error) {
      console.error('Error ending ride:', error);
    }
  };

  if (!ride) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Active Ride</h2>
        <button onClick={() => navigate('/rider/dashboard')} className="btn">
          Back to Dashboard
        </button>
      </div>

      <div className="container">
        <div className="card">
          <h3>Ride Details</h3>
          <div className="location-info">
            <span className={`ride-status status-${ride.status}`}>
              {ride.status.toUpperCase()}
            </span>
          </div>

          <div className="location-info">
            <strong>User:</strong> {ride.userId.name}
            <br />
            <strong>Phone:</strong> {ride.userId.phone}
          </div>

          <div className="location-info">
            <strong>Pickup:</strong> {ride.pickupLocation.address}
            <br />
            <small>
              ({ride.pickupLocation.lat}, {ride.pickupLocation.lng})
            </small>
          </div>

          <div className="location-info">
            <strong>Dropoff:</strong> {ride.dropoffLocation.address}
            <br />
            <small>
              ({ride.dropoffLocation.lat}, {ride.dropoffLocation.lng})
            </small>
          </div>

          <div className="location-info">
            <strong>Distance:</strong> {ride.distance} km
            <br />
            <strong>Fare:</strong> Rs. {ride.fare}
          </div>

          <div className="location-info">
            <strong>Current Location:</strong>
            <br />
            Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
          </div>

          {ride.status === 'accepted' && (
            <>
              <button onClick={startRide} className="btn btn-success">
                Start Ride
              </button>
              <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                Click "Start Ride" to begin the trip
              </p>
            </>
          )}

          {ride.status === 'in-progress' && (
            <>
              <button
                onClick={updateLocation}
                className="btn"
                style={{ marginBottom: '10px' }}
              >
                Update Location
              </button>
              <button onClick={endRide} className="btn btn-success">
                End Ride
              </button>
              <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                Click "Update Location" to send current location to user
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RideRequest;
