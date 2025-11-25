import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import axios from 'axios';

const containerStyle = {
  width: '100%',
  height: '400px',
};

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

const TrackOrder = ({ order, userId }) => {
  const [driverLocation, setDriverLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);
  const [animatedDriverLocation, setAnimatedDriverLocation] = useState(null);
  const [bearing, setBearing] = useState(0);

  const directionsServiceRef = useRef(null);
  const lastDriverLocationRef = useRef(null);
  const lastBroadcastRef = useRef(null);
  const animationFrameRef = useRef(null);
  const previousLocationRef = useRef(null);
  const mapRef = useRef(null);

  const customerLocation = order.shipping_address ? {
    lat: parseFloat(order.shipping_address.lat),
    lng: parseFloat(order.shipping_address.lng)
  } : null;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
  });

  // Calculate bearing between two points for car rotation
  const calculateBearing = (start, end) => {
    const startLat = start.lat * Math.PI / 180;
    const startLng = start.lng * Math.PI / 180;
    const endLat = end.lat * Math.PI / 180;
    const endLng = end.lng * Math.PI / 180;

    const dLng = endLng - startLng;
    const y = Math.sin(dLng) * Math.cos(endLat);
    const x = Math.cos(startLat) * Math.sin(endLat) -
      Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  };

  // Smooth animation from old position to new position
  const animateMarker = useCallback((startPos, endPos, duration = 2000) => {
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth movement
      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const lat = startPos.lat + (endPos.lat - startPos.lat) * easeProgress;
      const lng = startPos.lng + (endPos.lng - startPos.lng) * easeProgress;

      setAnimatedDriverLocation({ lat, lng });

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setAnimatedDriverLocation(endPos);
      }
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animate();
  }, []);

  // Update driver location with smooth animation
  useEffect(() => {
    if (!driverLocation) return;

    if (!animatedDriverLocation) {
      // First time - set immediately
      setAnimatedDriverLocation(driverLocation);
      previousLocationRef.current = driverLocation;
    } else {
      // Animate from current position to new position
      const newBearing = calculateBearing(animatedDriverLocation, driverLocation);
      setBearing(newBearing);
      animateMarker(animatedDriverLocation, driverLocation);
      previousLocationRef.current = driverLocation;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [driverLocation, animateMarker]);

  // Calculate ETA from directions
  const calculateETA = useCallback((directionsResult) => {
    if (directionsResult && directionsResult.routes && directionsResult.routes[0]) {
      const route = directionsResult.routes[0];
      const leg = route.legs[0];

      if (leg) {
        const etaData = {
          text: leg.duration.text,
          value: leg.duration.value, // in seconds
        };
        const distanceData = {
          text: leg.distance.text,
          value: leg.distance.value, // in meters
        };

        setEta(etaData);
        setDistance(distanceData);

        return {
          eta: etaData.text,
          eta_seconds: etaData.value,
          distance: distanceData.text,
          distance_meters: distanceData.value
        };
      }
    }
    return null;
  }, []);

  // Memoized directions fetch function with ETA calculation
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
          const etaData = calculateETA(result);

          // Broadcast ETA to customer
          if (etaData) {
            broadcastETA(etaData);
          }
        } else {
          console.error('Directions request failed due to:', status);
        }
      }
    );
  }, 30000), [calculateETA]); // Fetch every 30 seconds

  // Broadcast ETA to customer
  const broadcastETA = useCallback(throttle(async (etaData) => {
    if (!order?.id) return;

    try {
      await axios.post(`/orders/${order.id}/eta-update`, {
        ...etaData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error broadcasting ETA:', error);
    }
  }, 30000), [order?.id]); // Broadcast every 30 seconds

  // Broadcast driver location and ETA
  const broadcastLocationAndETA = useCallback(throttle(async (location) => {
    if (!order?.id) return;

    const broadcastData = {
      lat: location.lat,
      lng: location.lng,
      timestamp: new Date().toISOString(),
    };

    // Include ETA if available
    if (eta) {
      broadcastData.eta = eta.text;
      broadcastData.eta_seconds = eta.value;
    }

    if (distance) {
      broadcastData.distance = distance.text;
      broadcastData.distance_meters = distance.value;
    }

    try {
      await axios.post(`/orders/${order.id}/driver-location`, broadcastData);
      lastBroadcastRef.current = new Date().getTime();
    } catch (error) {
      console.error('Error broadcasting location:', error);
    }
  }, 10000), [order?.id, eta, distance]); // Every 10 seconds

  // Track driver location
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

        if (!lastDriverLocationRef.current ||
          Math.abs(newLocation.lat - lastDriverLocationRef.current.lat) > 0.0001 ||
          Math.abs(newLocation.lng - lastDriverLocationRef.current.lng) > 0.0001) {

          setDriverLocation(newLocation);
          lastDriverLocationRef.current = newLocation;
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Broadcast location and ETA when driver location changes
  useEffect(() => {
    if (!driverLocation || !order?.id) return;

    broadcastLocationAndETA(driverLocation);
  }, [driverLocation, order?.id, broadcastLocationAndETA]);

  // Fetch route and calculate ETA
  useEffect(() => {
    if (!isLoaded || !animatedDriverLocation || !customerLocation) return;

    fetchDirections(animatedDriverLocation, customerLocation);
  }, [isLoaded, animatedDriverLocation, customerLocation, fetchDirections]);

  if (loadError) return <div>Error loading maps</div>;

  const mapCenter = animatedDriverLocation || customerLocation || { lat: 0, lng: 0 };


  return (
    <section className="bg-white py-8 antialiased dark:bg-gray-800 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white sm:text-2xl">Delivery #{order.id}</h2>

        <div className="mt-6 sm:mt-8 lg:flex lg:gap-8">
          {/* Delivery Information Sidebar */}
          <div className="w-full divide-y divide-gray-200 overflow-hidden rounded-lg dark:divide-gray-700 dark:border-gray-700 lg:max-w-xl xl:max-w-2xl">
            {/* ETA Display */}
            <div className="space-y-4 p-6 bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">Estimated Arrival</h3>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {eta ? eta.text : 'Calculating...'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {distance ? distance.text : 'Calculating distance...'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    Last updated: {lastBroadcastRef.current ? new Date(lastBroadcastRef.current).toLocaleTimeString() : 'Never'}
                  </p>
                </div>
              </div>
            </div>

            {/* Rest of your existing sidebar content remains the same */}
            {/* Customer Information */}
            <div className="space-y-4 p-6">
              <div className="flex items-center gap-6">
                <div className="h-14 w-14 shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-800 dark:text-white">Customer Details</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{order.shipping_address.full_name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{order.shipping_address.phone}</p>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-4 p-6">
              <div className="flex items-center gap-6">
                <div className="h-14 w-14 shrink-0 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🏠</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-800 dark:text-white">Delivery Address</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{order.shipping_address.address_line}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{order.shipping_address.region}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4 p-6">
              <h3 className="font-medium text-gray-800 dark:text-white mb-4">Order Items</h3>

              {order?.items?.map((item, index) => (
                <div key={item.id || index} className="flex items-center justify-between gap-4 py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                      {item.product?.images?.[0]?.image_path ? (
                        <img
                          src={item.product.images[0].image_path}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm">⌚</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {item.product?.name || "Product"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ${item.price || item.subtotal}
                      </p>
                    </div>
                  </div>
                  <p className="text-base font-normal text-gray-800 dark:text-white">
                    x{item.quantity || 1}
                  </p>
                </div>
              ))}
            </div>

            {/* Delivery Actions */}
            {/* <div className="space-y-4 bg-gray-50 p-6 dark:bg-gray-800">
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => updateStatus('picked_up')}
                    className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-700 dark:hover:bg-blue-800 dark:focus:ring-blue-800">
                  Start Delivery
                </button>
                <button onClick={()=> updateStatus('delivered')}  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-100 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700">
                Arrived
                </button>
              </div>
            </div> */}
          </div>

          {/* Map & Timeline Section */}
          <div className="mt-6 grow sm:mt-8 lg:mt-0">
            {/* Map Section */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 mb-6">
              <div style={containerStyle}>
                {isLoaded && (
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={mapCenter}
                    zoom={13}
                    onLoad={(map) => { mapRef.current = map }}
                    options={{
                      zoomControl: true,
                      mapTypeControl: false,
                      streetViewControl: true,
                      fullscreenControl: true,
                      styles: [
                        {
                          "elementType": "geometry",
                          "stylers": [{ "color": "#f5f5f5" }]
                        },
                        {
                          "elementType": "labels.icon",
                          "stylers": [{ "visibility": "off" }]
                        },
                        {
                          "featureType": "poi",
                          "stylers": [{ "visibility": "off" }]
                        },
                        {
                          "featureType": "transit",
                          "stylers": [{ "visibility": "off" }]
                        }
                      ]
                    }}
                  >
                    {animatedDriverLocation && (
                      <Marker
                        position={animatedDriverLocation}
                        icon={{
                          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                              <text x="20" y="30" font-size="32" text-anchor="middle">🚗</text>
                            </svg>
                          `),
                          scaledSize: new google.maps.Size(40, 40),
                          anchor: new google.maps.Point(20, 20),
                        }}
                        title="Driver"
                      />
                    )}
                    {customerLocation && (
                      <Marker
                        position={customerLocation}
                        icon={{
                          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                            <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="24" cy="24" r="20" fill="#10B981" stroke="white" stroke-width="3"/>
                              <path d="M24 16 L24 20 M20 24 L28 24 M24 28 L24 32 M16 24 L20 24 M28 24 L32 24" stroke="white" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                          `),
                          scaledSize: new google.maps.Size(48, 48),
                          anchor: new google.maps.Point(24, 24),
                        }}
                        title="Delivery Location"
                      />
                    )}
                    {directions && (
                      <DirectionsRenderer
                        directions={directions}
                        options={{
                          suppressMarkers: true,
                          polylineOptions: {
                            strokeColor: "#3B82F6",
                            strokeWeight: 5,
                            strokeOpacity: 0.7
                          }
                        }}
                      />
                    )}
                  </GoogleMap>
                )}
              </div>
            </div>

            {/* Timeline Section - Updated with ETA */}
            <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Delivery Status</h3>

              <ol className="relative ms-3 border-s border-gray-200 dark:border-gray-700">
                <li className="mb-10 ms-6">
                  <span className="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 ring-8 ring-white dark:bg-primary-800 dark:ring-gray-800">
                    <svg className="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11.917 9.724 16.5 19 7.5" />
                    </svg>
                  </span>
                  <h4 className="mb-0.5 font-semibold">Order Assigned</h4>
                  <p className="text-sm">Driver assigned to delivery</p>
                  <p className="text-xs text-gray-500">2 min ago</p>
                </li>

                <li className="mb-10 ms-6">
                  <span className="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 ring-8 ring-white dark:bg-primary-800 dark:ring-gray-800">
                    <svg className="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h6l2 4m-8-4v8m0-8V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v9h2m8 0H9m4 0h2m4 0h2v-4m0 0h-5m3.5 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm-10 0a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
                    </svg>
                  </span>
                  <h4 className="mb-0.5 text-base font-semibold text-gray-800 dark:text-white">On the Way</h4>
                  <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    En route to customer
                    {eta && (
                      <span className="block text-green-600 font-medium">ETA: {eta.text}</span>
                    )}
                  </p>
                  {distance && (
                    <p className="text-xs text-gray-500">{distance.text} away</p>
                  )}
                </li>

                <li className="ms-6">
                  <span className="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white dark:bg-gray-700 dark:ring-gray-800">
                    <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5" />
                    </svg>
                  </span>
                  <h4 className="mb-0.5 text-base font-semibold text-gray-800 dark:text-white">Delivery Complete</h4>
                  <p className="text-sm font-normal text-gray-500 dark:text-gray-400">Order delivered to customer</p>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrackOrder;