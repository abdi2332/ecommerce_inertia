import React, { createContext, useContext, useState, useEffect } from "react";
import { usePage } from '@inertiajs/react'
import echo from '../../echo'

const StatusContext = createContext()

export const StatusProvider = ({ user, children }) => {

	const [driverLocation, setDriverLocation] = useState(null)
	const [eta, setEta] = useState(null)
	const [distance, setDistance] = useState(null)
	const [orderId, setOrderId] = useState(null)
	const [lastUpdate, setLastUpdate] = useState(null)

	useEffect(() => {

		if (!user) return;

		const channel = echo.private(`order.${user.id}`);


		channel.listen('.DriverLocationUpdate', (e) => {
			console.log('Driver location updated:', e);

			// Update driver location
			if (e.lat && e.lng) {
				setDriverLocation({
					lat: parseFloat(e.lat),
					lng: parseFloat(e.lng)
				});
			}

			// Update ETA information
			if (e.eta) {
				setEta({
					text: e.eta,
					seconds: e.eta_seconds
				});
			}

			// Update distance information
			if (e.distance) {
				setDistance({
					text: e.distance,
					meters: e.distance_meters
				});
			}

			// Update order ID and timestamp
			setOrderId(e.orderId);
			setLastUpdate(e.recorded_at || new Date().toISOString());
		});

		return () => {
			channel.stopListening('.DriverLocationUpdate');
		};

	}, [user]);

	return (
		<StatusContext.Provider value={{
			driverLocation,
			eta,
			distance,
			orderId,
			lastUpdate
		}}>
			{children}
		</StatusContext.Provider>
	)
}

export const useDriverLocation = () => {
	const context = useContext(StatusContext);
	if (context === undefined) {
		throw new Error('useDriverLocation must be used within a StatusProvider');
	}
	return context;
}

