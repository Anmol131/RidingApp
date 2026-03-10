// Random location generator for demo purposes
// These locations are in Kathmandu, Nepal

const kathmanduLocations = [
  { lat: 27.7172, lng: 85.3240, address: "Thamel, Kathmandu" },
  { lat: 27.7056, lng: 85.3079, address: "Kathmandu Durbar Square" },
  { lat: 27.6731, lng: 85.3250, address: "Patan, Lalitpur" },
  { lat: 27.6710, lng: 85.4298, address: "Bhaktapur Durbar Square" },
  { lat: 27.7215, lng: 85.3620, address: "Boudhanath Stupa" },
  { lat: 27.7148, lng: 85.2887, address: "Swayambhunath Temple" },
  { lat: 27.6954, lng: 85.3295, address: "New Baneshwor" },
  { lat: 27.7350, lng: 85.3260, address: "Maharajgunj" },
  { lat: 27.7380, lng: 85.3020, address: "Balaju" },
  { lat: 27.7240, lng: 85.3490, address: "Chabahil" }
];

// Generate random location from predefined list
exports.getRandomLocation = () => {
  const randomIndex = Math.floor(Math.random() * kathmanduLocations.length);
  return kathmanduLocations[randomIndex];
};

// Generate random location near a given point (within ~5km radius)
exports.getRandomNearbyLocation = (lat, lng) => {
  // Random offset in degrees (approximately 0.05 degree = ~5km)
  const offsetLat = (Math.random() - 0.5) * 0.05;
  const offsetLng = (Math.random() - 0.5) * 0.05;
  
  return {
    lat: lat + offsetLat,
    lng: lng + offsetLng,
    address: "Nearby location"
  };
};

// Get random pickup and dropoff locations (not same)
exports.getRandomRideLocations = () => {
  const pickup = exports.getRandomLocation();
  let dropoff = exports.getRandomLocation();
  
  // Make sure pickup and dropoff are different
  while (pickup.address === dropoff.address) {
    dropoff = exports.getRandomLocation();
  }
  
  return { pickup, dropoff };
};

// Calculate simple distance between two points (Haversine formula)
exports.calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

// Calculate estimated fare based on distance (simplified)
exports.calculateFare = (distance) => {
  const baseFare = 100; // Base fare in NPR (Nepali Rupees)
  const perKmRate = 25; // Per km rate in NPR
  
  return Math.round(baseFare + (distance * perKmRate));
};
