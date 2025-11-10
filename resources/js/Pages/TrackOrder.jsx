import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { Inertia } from '@inertiajs/inertia';
import echo from '../echo';
import axios from 'axios';

const containerStyle = {
  width: '100%',
  height: '400px',
};

// const Channel2=  echo.channel(`order.${user}`);

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

const TrackOrder = ({ order,userId }) => {

  const Channel2 =  echo.channel(`order.${userId}`);

  const [driverLocation, setDriverLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const directionsServiceRef = useRef(null);
  const lastDriverLocationRef = useRef(null);

  // Convert order.shipping_address to proper Google Maps format
  const customerLocation = order.shipping_address ? {
    lat: parseFloat(order.shipping_address.lat),
    lng: parseFloat(order.shipping_address.lng)
  } : null;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
  });


  const updateStatus = async (status) => {
    try {
        await axios.put(`/orders/${order.id}/update-status`, { status });
        // broadcast listener will update the UI automatically
    } catch (error) {
        console.error('Error updating order status:', error);
    }
};


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




  if (loadError) return <div>Error loading maps</div>;


  // Fallback center if no driver location yet
  const mapCenter = driverLocation || customerLocation || { lat: 0, lng: 0 };

  return (
<section class="bg-white py-8 antialiased dark:bg-gray-800 md:py-16">
  <div class="mx-auto max-w-screen-xl px-4 2xl:px-0">
    <h2 class="text-xl font-semibold text-gray-800 dark:text-white sm:text-2xl">Delivery #{order.id}</h2>

    <div class="mt-6 sm:mt-8 lg:flex lg:gap-8">
      {/* Delivery Information Sidebar */}
      <div class="w-full divide-y divide-gray-200 overflow-hidden rounded-lg  dark:divide-gray-700 dark:border-gray-700 lg:max-w-xl xl:max-w-2xl">
        {/* Customer Information */}
        <div class="space-y-4 p-6">
          <div class="flex items-center gap-6">
            <div class="h-14 w-14 shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-2xl">👤</span>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="font-medium text-gray-800 dark:text-white">Customer Details</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">{order.shipping_address.full_name}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">{order.shipping_address.phone}</p>
            </div>
          </div>
        </div>

        {/* Delivery order.shipping_address */}
        <div class="space-y-4 p-6">
          <div class="flex items-center gap-6">
            <div class="h-14 w-14 shrink-0 bg-green-100 rounded-full flex items-center justify-center">
              <span class="text-2xl">🏠</span>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="font-medium text-gray-800 dark:text-white">Delivery Address</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">{order.shipping_address.address_line}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">{order.shipping_address.region}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div class="space-y-4 p-6">
        <h3 class="font-medium text-gray-800 dark:text-white mb-4">Order Items</h3>
        
        {order?.items?.map((item, index) => (
          <div key={item.id || index} class="flex items-center justify-between gap-4 py-2">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                {item.product?.images?.[0]?.image_path ? (
                  <img 
                    src={item.product.images[0].image_path} 
                    alt={item.product.name}
                    class="w-full h-full object-cover"
                  />
                ) : (
                  <span class="text-sm">⌚</span>
                )}
              </div>
              <div>
                <p class="text-sm font-medium text-gray-800 dark:text-white">
                  {item.product?.name || "Product"}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  ${item.price || item.subtotal}
                </p>
              </div>
            </div>
            <p class="text-base font-normal text-gray-800 dark:text-white">
              x{item.quantity || 1}
            </p>
          </div>
        ))}
      </div>

        {/* Special Instructions */}
        <div class="space-y-4 p-6">
          <h3 class="font-medium text-gray-800 dark:text-white">Delivery Instructions</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Call upon arrival. No contact delivery preferred.</p>
        </div>

        {/* Delivery Actions */}
        <div class="space-y-4 bg-gray-50 p-6 dark:bg-gray-800">
          <div class="grid grid-cols-2 gap-3">
            <button onClick={() => updateStatus('picked_up')}
                class="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-700 dark:hover:bg-blue-800 dark:focus:ring-blue-800">
              Start Delivery
            </button>
            <button onClick={()=> updateStatus('delivered')}  class="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-100 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700">
            Arrived
            </button>
          </div>
          
         
        </div>
      </div>

      {/* Delivery Timeline & Map Section */}
      <div class="mt-6 grow sm:mt-8 lg:mt-0">
        {/* Map Section */}
        <div class="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 mb-6">
          <div style={containerStyle}>
            {isLoaded && (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={mapCenter}
              zoom={14}
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
              {driverLocation && (
                <Marker 
                  position={driverLocation}
                  icon={{
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <circle cx="20" cy="20" r="18" fill="%233B82F6" stroke="white" stroke-width="3"/>
                        <text x="20" y="26" text-anchor="middle" fill="white" font-size="14" font-weight="bold">🚗</text>
                      </svg>
                    `),
                    scaledSize: new google.maps.Size(40, 40),
                  }}
                />
              )}
              {customerLocation && (
                <Marker 
                  position={customerLocation}
                  icon={{
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <circle cx="20" cy="20" r="18" fill="%2310B981" stroke="white" stroke-width="3"/>
                        <text x="20" y="26" text-anchor="middle" fill="white" font-size="14" font-weight="bold">🏠</text>
                      </svg>
                    `),
                    scaledSize: new google.maps.Size(40, 40),
                  }}
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

        {/* Timeline Section */}
        <div class="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 class="text-xl font-semibold text-gray-800 dark:text-white">Delivery Status</h3>

          <ol class="relative ms-3 border-s border-gray-200 dark:border-gray-700">
            <li class="mb-10 ms-6">
              <span class="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 ring-8 ring-white dark:bg-primary-800 dark:ring-gray-800">
                <svg class="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11.917 9.724 16.5 19 7.5" />
                </svg>
              </span>
              <h4 class="mb-0.5 font-semibold">Order Assigned</h4>
              <p class="text-sm">Driver assigned to delivery</p>
              <p class="text-xs text-gray-500">2 min ago</p>
            </li>

            <li class="mb-10 ms-6 text-primary-700 dark:text-primary-500">
              <span class="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 ring-8 ring-white dark:bg-primary-800 dark:ring-gray-800">
                <svg class="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11.917 9.724 16.5 19 7.5" />
                </svg>
              </span>
              <h4 class="mb-0.5 font-semibold">Pickup Complete</h4>
              <p class="text-sm">Order picked up from restaurant</p>
              <p class="text-xs text-gray-500">15 min ago</p>
            </li>

            <li class="mb-10 ms-6">
              <span class="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white dark:bg-gray-700 dark:ring-gray-800">
                <svg class="h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h6l2 4m-8-4v8m0-8V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v9h2m8 0H9m4 0h2m4 0h2v-4m0 0h-5m3.5 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm-10 0a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"/>
                </svg>
              </span>
              <h4 class="mb-0.5 text-base font-semibold text-gray-800 dark:text-white">On the Way</h4>
              <p class="text-sm font-normal text-gray-500 dark:text-gray-400">En route to customer</p>
              <p class="text-xs text-gray-500">ETA: 12 minutes</p>
            </li>

            <li class="ms-6">
              <span class="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white dark:bg-gray-700 dark:ring-gray-800">
                <svg class="h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"/>
                </svg>
              </span>
              <h4 class="mb-0.5 text-base font-semibold text-gray-800 dark:text-white">Delivery Complete</h4>
              <p class="text-sm font-normal text-gray-500 dark:text-gray-400">Order delivered to customer</p>
            </li>
          </ol>

          {/* Customer Contact */}
          <div class="gap-4 sm:flex sm:items-center">
            <button type="button" class="w-full rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700">
              📞 Call 
            </button>

            <button class="mt-4 flex w-full items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 sm:mt-0">
              💬 Message 
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
  );
};

export default TrackOrder;