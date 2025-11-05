import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '600px',
};

// Throttle function to limit API calls
const throttle = (func, delay) => {
  let lastCall = 0;
  return (...args) => {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return func(...args);
  };
};

const TrackOrder = ({ Address }) => {
  const [driverLocation, setDriverLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const directionsServiceRef = useRef(null);
  const lastDriverLocationRef = useRef(null);

  // Convert address to proper Google Maps format
  const customerLocation = Address ? {
    lat: parseFloat(Address.lat),
    lng: parseFloat(Address.lng)
  } : null;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
  });

  // Memoized directions fetch function
  const fetchDirections = useCallback(throttle((origin, destination) => {
    if (!directionsServiceRef.current) {
      directionsServiceRef.current = new google.maps.DirectionsService();
    }

    directionsServiceRef.current.route(
      {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result);
        } else {
          console.error('Directions request failed due to:', status);
        }
      }
    );
  }, 2000), []); // Only fetch directions every 2 seconds

  // Track driver location in real-time
  useEffect(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        // Only update if location actually changed significantly
        if (!lastDriverLocationRef.current || 
            Math.abs(newLocation.lat - lastDriverLocationRef.current.lat) > 0.0001 ||
            Math.abs(newLocation.lng - lastDriverLocationRef.current.lng) > 0.0001) {
          
          setDriverLocation(newLocation);
          lastDriverLocationRef.current = newLocation;
        }
      },
      (err) => console.error('Geolocation error:', err),
      { 
        enableHighAccuracy: true, 
        maximumAge: 3000, // Cache for 3 seconds
        timeout: 10000 
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Fetch route from driver to customer - OPTIMIZED
  useEffect(() => {
    if (!isLoaded || !driverLocation || !customerLocation) return;

    fetchDirections(driverLocation, customerLocation);
  }, [isLoaded, driverLocation, customerLocation, fetchDirections]);

  // Debug: Log renders (remove in production)
  useEffect(() => {
    console.log('TrackOrder rendered');
  });

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Map...</div>;

  // Fallback center if no driver location yet
  const mapCenter = driverLocation || customerLocation || { lat: 0, lng: 0 };

  return (
    <div>
      <h2>Track Order</h2>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={14}
      >
        {driverLocation && <Marker position={driverLocation} label="Driver" />}
        {customerLocation && <Marker position={customerLocation} label="Customer" />}
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </div>
  );
};

export default TrackOrder;