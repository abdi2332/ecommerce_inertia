import React from 'react'
import { Link } from '@inertiajs/react'
import Footer from '@/Layouts/Footer'

const PaymentPage = ({order}) => {
   
  return (
    <>
    <section className="bg-white py-8 antialiased dark:bg-gray-800 md:py-16">
  <form action="#" className="mx-auto max-w-screen-xl px-4 2xl:px-0">
    <div className="mx-auto max-w-3xl">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white sm:text-2xl">Order summary</h2>

      <div className="mt-6 space-y-4 border-b border-t border-gray-200 py-8 dark:border-gray-700 sm:mt-8">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Billing & Delivery information</h4>

        <dl>
          <dt className="text-base font-medium text-gray-800 dark:text-white">User Address</dt>
          <dd className="mt-1 text-base font-normal text-gray-500 dark:text-gray-400">{order.shipping_address.full_name},{order.shipping_address.phone},{order.shipping_address.city}, {order.shipping_address.region}, Ethiopia, {order.shipping_address.address_line}</dd>
        </dl>

      </div>

      <div className="mt-6 sm:mt-8">
        <div className="relative overflow-x-auto border-b border-gray-200 dark:border-gray-800">
          <table className="w-full text-left font-medium text-gray-800 dark:text-white md:table-fixed">
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">

            {order.items.map((item) => ( 
              <tr>
                <td className="whitespace-nowrap py-4 md:w-[384px]">
                  <div className="flex items-center gap-4">
                    <a href="#" className="flex items-center aspect-square w-10 h-10 shrink-0">
                      <img className="h-auto w-full max-h-full dark:hidden" src={item.product.images[0].image_path} alt=" image" />
                      <img className="hidden h-auto w-full max-h-full dark:block" src={item.product.images[0].image_path} alt="imac image" />
                    </a>
                    <a href="#" className="hover:underline">{item.product.name}</a>
                  </div>
                </td>

                <td className="p-4 text-base font-normal text-gray-800 dark:text-white">x1</td>

                <td className="p-4 text-right text-base font-bold text-gray-800 dark:text-white">$1,499</td>
              </tr>
            ))}

            </tbody>
          </table>
        </div>

        <div className="mt-4 space-y-6">
          <h4 className="text-xl font-semibold text-gray-800 dark:text-white">Order summary</h4>

          <div className="space-y-4">
            <div className="space-y-2">
              <dl className="flex items-center justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Original price</dt>
                <dd className="text-base font-medium text-gray-800 dark:text-white">{order.subtotal}</dd>
              </dl>

              <dl className="flex items-center justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Shipping Fee</dt>
                <dd className="text-base font-medium text-green-500">{order.shipping_fee}</dd>
              </dl>

              <dl className="flex items-center justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Payment Status</dt>
                <dd className="text-base font-medium text-gray-800 dark:text-white">{order.status}</dd>
              </dl>

              <dl className="flex items-center justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Tax</dt>
                <dd className="text-base font-medium text-gray-800 dark:text-white">{order.tax}</dd>
              </dl>
            </div>

            <dl className="flex items-center justify-between gap-4 border-t border-gray-200 pt-2 dark:border-gray-700">
              <dt className="text-lg font-bold text-gray-800 dark:text-white">Total</dt>
              <dd className="text-lg font-bold text-gray-800 dark:text-white">{order.total}</dd>
            </dl>
          </div>

          <div className="gap-4 sm:flex sm:items-center">
            <button type="button" className="w-full rounded-lg  border border-gray-200 bg-white px-5  py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700">Return to Shopping</button>

            <button type="submit" className="mt-4 flex w-full items-center justify-center rounded-lg bg-primary-700  px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300  dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 sm:mt-0">Pay</button>
          </div>
        </div>
      </div>
    </div>
  </form>
</section>
<Footer />
</>
  )
}

export default PaymentPage