require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config.js/db');
const app = express();

const http = require('http');
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Routes
const userRoutes = require('./routes/userRoutes');
const rideRoutes = require('./routes/rideRoute');
const riderRoutes = require('./routes/riderRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const locationRoutes = require('./routes/locationRoutes');

// Register Routes
app.use('/api/users', userRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/riders', riderRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/locations', locationRoutes);

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Import models for socket operations
const Ride = require('./models/Ride');
const Rider = require('./models/Rider');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


io.on('connection', (socket) => {

  console.log('User connected');
  console.log('Socket id:', socket.id);


  // USER BOOKS RIDE - Create in database
  socket.on('book ride', async (rideData) => {
    try {
      console.log("Ride booking request:", rideData);

      // Create ride in database
      const ride = await Ride.create({
        userId: rideData.userId,
        pickupLocation: rideData.pickupLocation,
        dropoffLocation: rideData.dropoffLocation,
        status: "pending"
      });

      const populatedRide = await Ride.findById(ride._id)
        .populate('userId', '-password');

      console.log("Ride created:", ride._id);

      // Emit to all active riders
      io.emit('new ride request', populatedRide);
      
      // Confirm to user
      socket.emit('ride booked', populatedRide);

    } catch (error) {
      console.error("Error booking ride:", error);
      socket.emit('booking error', { message: error.message });
    }
  });


  // RIDER ACCEPTS RIDE - Update database
  socket.on('accept ride', async (data) => {
    try {
      const { rideId, riderId } = data;
      console.log(`Rider ${riderId} accepting ride ${rideId}`);

      // Update ride with rider info
      const ride = await Ride.findByIdAndUpdate(
        rideId,
        { 
          riderId: riderId,
          status: "accepted"
        },
        { new: true }
      )
        .populate('userId', '-password')
        .populate('riderId', '-password');

      if (!ride) {
        socket.emit('accept error', { message: "Ride not found" });
        return;
      }

      console.log("Ride accepted:", rideId);

      // Notify user that ride was accepted
      io.emit('ride accepted', ride);

    } catch (error) {
      console.error("Error accepting ride:", error);
      socket.emit('accept error', { message: error.message });
    }
  });


  // RIDER SENDS LOCATION - Update database and broadcast
  socket.on('rider location', async (data) => {
    try {
      const { riderId, location, rideId } = data;
      console.log("Location update from rider:", riderId);

      // Update rider location in database
      await Rider.findByIdAndUpdate(riderId, {
        location: { lat: location.lat, lng: location.lng }
      });

      // If rideId provided, update ride status
      if (rideId) {
        await Ride.findByIdAndUpdate(rideId, {
          status: "in-progress"
        });
      }

      // Broadcast location to user
      io.emit('location update', {
        riderId,
        rideId,
        location
      });

    } catch (error) {
      console.error("Error updating location:", error);
    }
  });


  // USER CANCELS RIDE - Update database
  socket.on('cancel ride', async (rideId) => {
    try {
      console.log("Ride cancellation:", rideId);

      const ride = await Ride.findByIdAndUpdate(
        rideId,
        { status: "cancelled" },
        { new: true }
      );

      if (!ride) {
        socket.emit('cancel error', { message: "Ride not found" });
        return;
      }

      console.log("Ride cancelled:", rideId);

      // Notify all parties
      io.emit('ride cancelled', ride);

    } catch (error) {
      console.error("Error cancelling ride:", error);
      socket.emit('cancel error', { message: error.message });
    }
  });


  // RIDER ENDS RIDE - Update database
  socket.on('end ride', async (data) => {
    try {
      const { rideId, fare } = data;
      console.log("Ride ending:", rideId);

      const ride = await Ride.findByIdAndUpdate(
        rideId,
        { 
          status: "completed",
          fare: fare || 0,
          paymentStatus: "pending"
        },
        { new: true }
      )
        .populate('userId', '-password')
        .populate('riderId', '-password');

      if (!ride) {
        socket.emit('end error', { message: "Ride not found" });
        return;
      }

      console.log("Ride completed:", rideId);

      // Notify all parties
      io.emit('ride ended', ride);

      // Update rider to inactive
      if (ride.riderId) {
        await Rider.findByIdAndUpdate(ride.riderId._id, {
          isActive: false
        });
      }

    } catch (error) {
      console.error("Error ending ride:", error);
      socket.emit('end error', { message: error.message });
    }
  });


  // RIDER GOES ONLINE/OFFLINE
  socket.on('rider status', async (data) => {
    try {
      const { riderId, isActive } = data;
      
      await Rider.findByIdAndUpdate(riderId, { isActive });
      
      console.log(`Rider ${riderId} is now ${isActive ? 'online' : 'offline'}`);
      
      io.emit('rider status changed', { riderId, isActive });

    } catch (error) {
      console.error("Error updating rider status:", error);
    }
  });


  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

});


// 404 Handler - Must be after all other routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {

  console.log(`Server running on port ${PORT}`);

});