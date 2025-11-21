import React, { createContext, useContext, useState, useEffect, use } from "react";
import { usePage } from '@inertiajs/react'
import echo from '../../echo'
import { Inertia, } from '@inertiajs/inertia';


const StatusContext = createContext()

export const StatusProvider = ({user, children}) => {

	const [status, setStatus] = useState([])



	useEffect(() => {

		if (!user) return;

		const channel = echo.private(`order.${user.id}`);

		
		channel.listen('.DriverLocationUpdate', (e) => {
			console.log('Delivery status updated:', e);
		});

	}, [user]);




	return (
		<StatusContext.Provider value={{}}>
			{children}
		</StatusContext.Provider>
	)
}

