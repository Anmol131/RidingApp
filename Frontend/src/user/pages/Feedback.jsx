import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { feedbackAPI, rideAPI } from '../services/api';

function Feedback() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadRide();
  }, [rideId]);

  const loadRide = async () => {
    try {
      const response = await rideAPI.getRide(rideId);
      setRide(response.data);
    } catch (error) {
      setError('Failed to load ride details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await feedbackAPI.createFeedback({
        rideId: ride._id,
        userId: ride.userId._id,
        riderId: ride.riderId._id,
        rating,
        comment,
        feedbackType: 'user-to-rider',
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/user/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  if (!ride) {
    return <div className="container">Loading...</div>;
  }

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h2>Thank You!</h2>
          <p className="success">Feedback submitted successfully</p>
          <p>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Rate Your Ride</h2>
        <div className="location-info">
          <strong>Rider:</strong> {ride.riderId.name}
          <br />
          <strong>Vehicle:</strong> {ride.riderId.vehicleType} (
          {ride.riderId.vehicleNumber})
          <br />
          <strong>Fare:</strong> Rs. {ride.fare}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Rating</label>
            <div
              className="star-rating"
              style={{ justifyContent: 'center', marginTop: '10px' }}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${
                    star <= (hoveredRating || rating) ? 'filled' : ''
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Comment (Optional)</label>
            <textarea
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/user/dashboard')}
            className="btn btn-secondary"
            style={{ marginTop: '10px' }}
          >
            Skip
          </button>
        </form>
      </div>
    </div>
  );
}

export default Feedback;
