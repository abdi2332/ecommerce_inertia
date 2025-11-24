import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api'
import { useDriverLocation } from './components/StatusProvider'
import { router } from '@inertiajs/react'
import { useCart } from './components/CartProvider'

const containerStyle = {
    width: '100%',
    height: '400px',
}

const CustomerTrack = ({ order, status }) => {
    const { driverLocation, eta, distance, lastUpdate } = useDriverLocation()
    const [directions, setDirections] = useState(null)
    const [animatedDriverLocation, setAnimatedDriverLocation] = useState(null)
    const [bearing, setBearing] = useState(0)
    const animationFrameRef = useRef(null)
    const previousLocationRef = useRef(null)
    const mapRef = useRef(null)
    const { cart, setCart } = useCart();
    
        // toast.success("Order placed successfully!");
        useEffect(() => {
            setCart([]);
            localStorage.removeItem("cart");
        }, []);

    // Memoize customerLocation to prevent map re-centering on every render
    const customerLocation = useMemo(() => {
        if (!order.shipping_address) return null
        return {
            lat: parseFloat(order.shipping_address.lat),
            lng: parseFloat(order.shipping_address.lng)
        }
    }, [order.shipping_address?.lat, order.shipping_address?.lng])

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: apiKey,
    })

    // Calculate bearing between two points for car rotation
    const calculateBearing = (start, end) => {
        const startLat = start.lat * Math.PI / 180
        const startLng = start.lng * Math.PI / 180
        const endLat = end.lat * Math.PI / 180
        const endLng = end.lng * Math.PI / 180

        const dLng = endLng - startLng
        const y = Math.sin(dLng) * Math.cos(endLat)
        const x = Math.cos(startLat) * Math.sin(endLat) -
            Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng)

        const bearing = Math.atan2(y, x) * 180 / Math.PI
        return (bearing + 360) % 360
    }

    // Smooth animation from old position to new position
    const animateMarker = useCallback((startPos, endPos, duration = 2000) => {
        const startTime = Date.now()

        const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)

            // Easing function for smooth movement
            const easeProgress = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2

            const lat = startPos.lat + (endPos.lat - startPos.lat) * easeProgress
            const lng = startPos.lng + (endPos.lng - startPos.lng) * easeProgress

            setAnimatedDriverLocation({ lat, lng })

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate)
            } else {
                setAnimatedDriverLocation(endPos)
            }
        }

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
        }

        animate()
    }, [])

    // Update driver location with smooth animation
    useEffect(() => {
        if (!driverLocation) return

        if (!animatedDriverLocation) {
            // First time - set immediately
            setAnimatedDriverLocation(driverLocation)
            previousLocationRef.current = driverLocation
        } else {
            // Animate from current position to new position
            const newBearing = calculateBearing(animatedDriverLocation, driverLocation)
            setBearing(newBearing)
            animateMarker(animatedDriverLocation, driverLocation)
            previousLocationRef.current = driverLocation
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [driverLocation, animateMarker])

    // Fetch directions when driver location changes
    useEffect(() => {
        if (!isLoaded || !animatedDriverLocation || !customerLocation) return

        const directionsService = new google.maps.DirectionsService()

        directionsService.route(
            {
                origin: animatedDriverLocation,
                destination: customerLocation,
                travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === 'OK') {
                    setDirections(result)
                } else {
                    console.error('Directions request failed:', status)
                }
            }
        )
    }, [isLoaded, animatedDriverLocation, customerLocation])

    if (loadError) return <div>Error loading maps</div>

    const mapCenter = animatedDriverLocation || customerLocation || { lat: 0, lng: 0 }

    return (
        <section class="bg-white py-8 antialiased dark:bg-gray-900 md:py-16">
            <div class="mx-auto max-w-screen-xl px-4 2xl:px-0">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">Track the delivery of order #{order.id}</h2>

                <div class="w-full mt-6 sm:mt-8 lg:flex lg:gap-8">
                    {/* Order Items Section */}
                    <div class="w-full divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700 lg:max-w-sm xl:max-w-lg">
                        {/* Product items */}
                        {order?.items?.map((item, index) => (
                            <div key={item.id || index} class="space-y-4 p-6">
                                <div class="flex items-center gap-6">
                                    <a href="#" class="h-14 w-14 shrink-0">
                                        <img
                                            src={item.product?.images?.[0]?.image_path || "https://flowbite.s3.amazonaws.com/blocks/e-commerce/imac-front.svg"}
                                            alt={item.product?.name || "product image"}
                                            class="h-full w-full object-cover dark:hidden"
                                        />
                                        <img
                                            src={item.product?.images?.[0]?.image_path || "https://flowbite.s3.amazonaws.com/blocks/e-commerce/imac-front-dark.svg"}
                                            alt={item.product?.name || "product image"}
                                            class="hidden h-full w-full object-cover dark:block"
                                        />
                                    </a>

                                    <a href="#" class="min-w-0 flex-1 font-medium text-gray-900 hover:underline dark:text-white">{item.product?.name || "Product"}</a>
                                </div>

                                <div class="flex items-center justify-between gap-4">
                                    <p class="text-sm font-normal text-gray-500 dark:text-gray-400"><span class="font-medium text-gray-900 dark:text-white">Product ID:</span> BJ8364850</p>

                                    <div class="flex items-center justify-end gap-4">
                                        <p class="text-base font-normal text-gray-900 dark:text-white">x{item.quantity || 1}</p>

                                        <p class="text-xl font-bold leading-tight text-gray-900 dark:text-white">${item.price || item.subtotal}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Delivery Tracking Section */}
                    <div class="mt-6 grow sm:mt-8 lg:mt-0">
                        {/* Real-time Delivery Status */}
                        <div class="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 mb-6">
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Delivery Status</h3>

                            {/* Status Cards */}
                            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                                {/* ETA Card */}
                                <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                    <div class="flex items-center gap-3">
                                        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
                                            <svg class="h-5 w-5 text-primary-600 dark:text-primary-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Arrival</p>
                                            <p class="text-lg font-bold text-gray-900 dark:text-white">
                                                {eta ? eta.text : 'Calculating...'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Distance Card */}
                                <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                    <div class="flex items-center gap-3">
                                        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                            <svg class="h-5 w-5 text-green-600 dark:text-green-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.8 13.938h-.011a7 7 0 1 0-11.464.144h-.016l.14.171c.1.127.2.251.3.371L12 21l5.13-6.248c.194-.209.374-.429.54-.659l.13-.155Z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Distance</p>
                                            <p class="text-lg font-bold text-gray-900 dark:text-white">
                                                {distance ? distance.text : 'Calculating...'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Driver Status Card */}
                                <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                    <div class="flex items-center gap-3">
                                        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                            <svg class="h-5 w-5 text-blue-600 dark:text-blue-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h6l2 4m-8-4v8m0-8V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v9h2m8 0H9m4 0h2m4 0h2v-4m0 0h-5m3.5 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm-10 0a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                                            <p class="text-lg font-bold text-gray-900 dark:text-white">
                                                {driverLocation ? 'On the way' : 'Preparing'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Map Container */}
                            <div class="mt-4">
                                <div class="mb-2 flex items-center justify-between">
                                    <h4 class="text-lg font-medium text-gray-900 dark:text-white">Driver Location</h4>
                                    <span class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                                        <span class="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                        {driverLocation ? 'Live Tracking' : 'Waiting for driver'}
                                    </span>
                                </div>
                                <div class="rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-700 overflow-hidden" style={containerStyle}>
                                    {isLoaded && customerLocation ? (
                                        <GoogleMap
                                            mapContainerStyle={containerStyle}
                                            center={customerLocation}
                                            zoom={13}
                                            onLoad={(map) => { mapRef.current = map }}
                                            options={{
                                                zoomControl: true,
                                                mapTypeControl: false,
                                                streetViewControl: false,
                                                fullscreenControl: true,
                                                styles: [
                                                    {
                                                        "featureType": "poi",
                                                        "stylers": [{ "visibility": "off" }]
                                                    }
                                                ]
                                            }}
                                        >
                                            {/* Driver Marker - Just emoji, no pin */}
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

                                            {/* Customer Location Marker */}
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

                                            {/* Route Polyline */}
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
                                    ) : (
                                        <div class="flex h-full w-full items-center justify-center">
                                            <div class="text-center">
                                                <svg class="mx-auto h-12 w-12 text-gray-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading map...</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {lastUpdate && (
                                    <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        Last updated: {new Date(lastUpdate).toLocaleTimeString()}
                                    </p>
                                )}
                            </div>

                            {/* Status Updates */}
                            <div class="mt-4">
                                <h4 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">Latest Update</h4>
                                <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                                    <div class="flex items-start gap-3">
                                        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
                                            <svg class="h-4 w-4 text-primary-600 dark:text-primary-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="font-medium text-gray-900 dark:text-white">
                                                {driverLocation
                                                    ? `Driver is ${distance?.text || 'on the way'} away`
                                                    : 'Waiting for driver to start delivery'}
                                            </p>
                                            <p class="text-sm text-gray-500 dark:text-gray-400">
                                                {lastUpdate ? `Updated ${new Date(lastUpdate).toLocaleTimeString()}` : 'Waiting for updates...'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order History Timeline */}
                        <div class="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Order History</h3>

                            <ol class="relative ms-3 border-s border-gray-200 dark:border-gray-700">
                                {/* Current Status - Out for Delivery */}
                                <li class="mb-10 ms-6">
                                    <span class="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 ring-8 ring-white dark:bg-primary-900 dark:ring-gray-800">
                                        <svg class="h-4 w-4 text-primary-600 dark:text-primary-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h6l2 4m-8-4v8m0-8V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v9h2m8 0H9m4 0h2m4 0h2v-4m0 0h-5m3.5 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm-10 0a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
                                        </svg>
                                    </span>
                                    <h4 class="mb-0.5 text-base font-semibold text-gray-900 dark:text-white">Out for Delivery</h4>
                                    <p class="text-sm font-normal text-gray-500 dark:text-gray-400">Your order is on the way</p>
                                    <p class="text-xs text-primary-600 dark:text-primary-400 mt-1">Current Status</p>
                                </li>

                                {/* Picked Up */}
                                {status && (
                                    <li class="mb-10 ms-6 text-primary-700 dark:text-primary-500">
                                        <span class="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 ring-8 ring-white dark:bg-primary-900 dark:ring-gray-800">
                                            <svg class="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11.917 9.724 16.5 19 7.5" />
                                            </svg>
                                        </span>
                                        <h4 class="mb-0.5 font-semibold">{new Date(status.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</h4>
                                        <p class="text-sm">Order picked up by driver</p>
                                    </li>
                                )}

                                {/* Processing */}
                                <li class="mb-10 ms-6 text-primary-700 dark:text-primary-500">
                                    <span class="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 ring-8 ring-white dark:bg-primary-900 dark:ring-gray-800">
                                        <svg class="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11.917 9.724 16.5 19 7.5" />
                                        </svg>
                                    </span>
                                    <h4 class="mb-0.5 font-semibold">{new Date(order.updated_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</h4>
                                    <p class="text-sm">Order processing completed</p>
                                </li>

                                {/* Ordered */}
                                <li class="ms-6 text-primary-700 dark:text-primary-500">
                                    <span class="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 ring-8 ring-white dark:bg-primary-900 dark:ring-gray-800">
                                        <svg class="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11.917 9.724 16.5 19 7.5" />
                                        </svg>
                                    </span>
                                    <div>
                                        <h4 class="mb-0.5 font-semibold">{new Date(order.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</h4>
                                        <a href="#" class="text-sm font-medium hover:underline">Order placed - Receipt #{order.id}</a>
                                    </div>
                                </li>
                            </ol>

                            <div class="gap-4 sm:flex sm:items-center">
                              <a
                                                      href="/"
                                                      onClick={(e) => {
                                                          e.preventDefault();
                                                          // Clear frontend cart
                                                          setCart([]);
                                                          localStorage.removeItem("cart");
                          
                                                          // Redirect via Inertia to trigger fresh backend share data
                                                          router.visit("/", {
                                                              replace: true,
                                                              preserveState: false,
                                                              preserveScroll: false,
                                                          });
                                                      }}
                                                      className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                                                  >
                                                      Return to shopping
                                                  </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CustomerTrack