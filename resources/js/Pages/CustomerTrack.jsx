import React, { useState } from 'react'
import echo from '../echo'
import { usePage } from '@inertiajs/react'

const CustomerTrack = ({ order,status }) => {

    const [DriverLocation, setDriverLocation]= useState([])




    return (
        <section class="bg-white py-8 antialiased dark:bg-gray-900 md:py-16">
            <div class="mx-auto max-w-screen-xl px-4 2xl:px-0">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">Track the delivery of order #{order.id}</h2>

                <div class="w-full mt-6 sm:mt-8 lg:flex lg:gap-8">
                    {/* <!-- Order Items Section --> */}
                    <div class="w-full divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700 lg:max-w-sm xl:max-w-lg">
                        {/* <!-- Product items (unchanged) --> */}

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

                                    <a href="#" class="min-w-0 flex-1 font-medium text-gray-900 hover:underline dark:text-white">         {item.product?.name || "Product"}</a>
                                </div>

                                <div class="flex items-center justify-between gap-4">
                                    <p class="text-sm font-normal text-gray-500 dark:text-gray-400"><span class="font-medium text-gray-900 dark:text-white">Product ID:</span> BJ8364850</p>

                                    <div class="flex items-center justify-end gap-4">
                                        <p class="text-base font-normal text-gray-900 dark:text-white">         x{item.quantity || 1}</p>

                                        <p class="text-xl font-bold leading-tight text-gray-900 dark:text-white">  ${item.price || item.subtotal}</p>
                                    </div>
                                </div>
                            </div>

                        ))}


                    </div>
                    {/* 
            <!-- Delivery Tracking Section --> */}
                    <div class="mt-6 grow sm:mt-8 lg:mt-0">
                        {/* <!-- Real-time Delivery Status --> */}
                        <div class="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 mb-6">
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Delivery Status</h3>

                            {/* <!-- Status Cards --> */}
                            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                                {/* <!-- ETA Card --> */}
                                <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                    <div class="flex items-center gap-3">
                                        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
                                            <svg class="h-5 w-5 text-primary-600 dark:text-primary-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Arrival</p>
                                            <p class="text-lg font-bold text-gray-900 dark:text-white">25 min</p>
                                        </div>
                                    </div>
                                </div>

                                {/* <!-- Driver Info Card --> */}
                                <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                    <div class="flex items-center gap-3">
                                        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                            <svg class="h-5 w-5 text-green-600 dark:text-green-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 19h4a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-2m-2.236-4a3 3 0 1 0 0-4M3 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Driver</p>
                                            <p class="text-lg font-bold text-gray-900 dark:text-white">Michael S.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* <!-- Vehicle Info Card --> */}
                                <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                    <div class="flex items-center gap-3">
                                        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                            <svg class="h-5 w-5 text-blue-600 dark:text-blue-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 9h3m-3 3h3m-3 3h3m-6 3a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6 9h.01M9 9h.01M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-4.5M6 14h.01M15 9a2 2 0 0 1 2 2v1.5M4 9h16M4 14h3" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Vehicle</p>
                                            <p class="text-lg font-bold text-gray-900 dark:text-white">DHL Van #482</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* <!-- Map Container --> */}
                            <div class="mt-4">
                                <div class="mb-2 flex items-center justify-between">
                                    <h4 class="text-lg font-medium text-gray-900 dark:text-white">Driver Location</h4>
                                    <span class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                                        <span class="h-2 w-2 rounded-full bg-green-500"></span>
                                        Live Tracking
                                    </span>
                                </div>
                                <div class="h-64 w-full rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-700" id="delivery-map">
                                    {/* <!-- Map would be rendered here by a mapping service like Google Maps or Mapbox --> */}
                                    <div class="flex h-full w-full items-center justify-center">
                                        <div class="text-center">
                                            <svg class="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h2m2 4h6m-5 6v.01M12 16v.01" />
                                            </svg>
                                            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Interactive map would appear here</p>
                                            <p class="text-xs text-gray-400 dark:text-gray-500">Driver location updated in real-time</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* <!-- Status Updates --> */}
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
                                            <p class="font-medium text-gray-900 dark:text-white">Driver is on the way to your location</p>
                                            <p class="text-sm text-gray-500 dark:text-gray-400">Updated just now</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* <!-- Order History Timeline --> */}
                        <div class="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Order History</h3>

                            <ol class="relative ms-3 border-s border-gray-200 dark:border-gray-700">
                                {/* <!-- Current Status - Out for Delivery --> */}
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

                                {/* <!-- Picked Up --> */}
                                <li class="mb-10 ms-6 text-primary-700 dark:text-primary-500">
                                    <span class="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 ring-8 ring-white dark:bg-primary-900 dark:ring-gray-800">
                                        <svg class="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11.917 9.724 16.5 19 7.5" />
                                        </svg>
                                    </span>
                                    <h4 class="mb-0.5 font-semibold"> {new Date(status.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</h4>
                                    <p class="text-sm">Order picked up by driver</p>
                                </li>

                                {/* <!-- Arrived at Facility --> */}
                                {/* <li class="mb-10 ms-6 text-primary-700 dark:text-primary-500">
                                    <span class="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 ring-8 ring-white dark:bg-primary-900 dark:ring-gray-800">
                                        <svg class="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11.917 9.724 16.5 19 7.5" />
                                        </svg>
                                    </span>
                                    <h4 class="mb-0.5 text-base font-semibold">Yesterday, 03:45 PM</h4>
                                    <p class="text-sm">Arrived at local distribution facility</p>
                                </li> */}

                                {/* <!-- Shipped --> */}
                                {/* <li class="mb-10 ms-6 text-primary-700 dark:text-primary-500">
                                    <span class="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 ring-8 ring-white dark:bg-primary-900 dark:ring-gray-800">
                                        <svg class="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11.917 9.724 16.5 19 7.5" />
                                        </svg>
                                    </span>
                                    <h4 class="mb-0.5 font-semibold">Nov 22, 2023, 11:20 AM</h4>
                                    <p class="text-sm">Order shipped from warehouse</p>
                                </li> */}

                                {/* <!-- Processing --> */}
                                <li class="mb-10 ms-6 text-primary-700 dark:text-primary-500">
                                    <span class="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 ring-8 ring-white dark:bg-primary-900 dark:ring-gray-800">
                                        <svg class="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11.917 9.724 16.5 19 7.5" />
                                        </svg>
                                    </span>
                                    <h4 class="mb-0.5 font-semibold"> {new Date(order.updated_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</h4>
                                    <p class="text-sm">Order processing completed</p>
                                </li>

                                {/* <!-- Ordered --> */}
                                <li class="ms-6 text-primary-700 dark:text-primary-500">
                                    <span class="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 ring-8 ring-white dark:bg-primary-900 dark:ring-gray-800">
                                        <svg class="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11.917 9.724 16.5 19 7.5" />
                                        </svg>
                                    </span>
                                    <div>
                                        <h4 class="mb-0.5 font-semibold"> {new Date(order.created_at).toLocaleDateString('en-US', {
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
                                <button type="button" class="w-full rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700">Contact Driver</button>

                                <a href="#" class="mt-4 flex w-full items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 sm:mt-0">Order Details</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CustomerTrack