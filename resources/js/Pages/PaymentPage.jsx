import React from 'react'
import { Link } from '@inertiajs/react'

const PaymentPage = ({order}) => {
    console.log(order);
  return (
    <>
    <section className="bg-white py-8 antialiased dark:bg-gray-800 md:py-16">
  <form action="#" className="mx-auto max-w-screen-xl px-4 2xl:px-0">
    <div className="mx-auto max-w-3xl">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white sm:text-2xl">Order summary</h2>

      <div className="mt-6 space-y-4 border-b border-t border-gray-200 py-8 dark:border-gray-700 sm:mt-8">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Billing & Delivery information</h4>

        <dl>
          <dt className="text-base font-medium text-gray-800 dark:text-white">Individual</dt>
          <dd className="mt-1 text-base font-normal text-gray-500 dark:text-gray-400">Bonnie Green - +1 234 567 890, San Francisco, California, United States, 3454, Scott Street</dd>
        </dl>

        <button type="button" data-modal-target="billingInformationModal" data-modal-toggle="billingInformationModal" className="text-base font-medium text-primary-700 hover:underline dark:text-primary-500">Edit</button>
      </div>

      <div className="mt-6 sm:mt-8">
        <div className="relative overflow-x-auto border-b border-gray-200 dark:border-gray-800">
          <table className="w-full text-left font-medium text-gray-800 dark:text-white md:table-fixed">
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              <tr>
                <td className="whitespace-nowrap py-4 md:w-[384px]">
                  <div className="flex items-center gap-4">
                    <a href="#" className="flex items-center aspect-square w-10 h-10 shrink-0">
                      <img className="h-auto w-full max-h-full dark:hidden" src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/imac-front.svg" alt="imac image" />
                      <img className="hidden h-auto w-full max-h-full dark:block" src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/imac-front-dark.svg" alt="imac image" />
                    </a>
                    <a href="#" className="hover:underline">Apple iMac 27”</a>
                  </div>
                </td>

                <td className="p-4 text-base font-normal text-gray-800 dark:text-white">x1</td>

                <td className="p-4 text-right text-base font-bold text-gray-800 dark:text-white">$1,499</td>
              </tr>

              <tr>
                <td className="whitespace-nowrap py-4 md:w-[384px]">
                  <div className="flex items-center gap-4">
                    <a href="#" className="flex items-center aspect-square w-10 h-10 shrink-0">
                      <img className="h-auto w-full max-h-full dark:hidden" src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/iphone-light.svg" alt="imac image" />
                      <img className="hidden h-auto w-full max-h-full dark:block" src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/iphone-dark.svg" alt="imac image" />
                    </a>
                    <a href="#" className="hover:underline">Apple iPhone 14</a>
                  </div>
                </td>

                <td className="p-4 text-base font-normal text-gray-800 dark:text-white">x2</td>

                <td className="p-4 text-right text-base font-bold text-gray-800 dark:text-white">$1,998</td>
              </tr>

            </tbody>
          </table>
        </div>

        <div className="mt-4 space-y-6">
          <h4 className="text-xl font-semibold text-gray-800 dark:text-white">Order summary</h4>

          <div className="space-y-4">
            <div className="space-y-2">
              <dl className="flex items-center justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Original price</dt>
                <dd className="text-base font-medium text-gray-800 dark:text-white">$6,592.00</dd>
              </dl>

              <dl className="flex items-center justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Savings</dt>
                <dd className="text-base font-medium text-green-500">-$299.00</dd>
              </dl>

              <dl className="flex items-center justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Store Pickup</dt>
                <dd className="text-base font-medium text-gray-800 dark:text-white">$99</dd>
              </dl>

              <dl className="flex items-center justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Tax</dt>
                <dd className="text-base font-medium text-gray-800 dark:text-white">$799</dd>
              </dl>
            </div>

            <dl className="flex items-center justify-between gap-4 border-t border-gray-200 pt-2 dark:border-gray-700">
              <dt className="text-lg font-bold text-gray-800 dark:text-white">Total</dt>
              <dd className="text-lg font-bold text-gray-800 dark:text-white">$7,191.00</dd>
            </dl>
          </div>

          <div className="flex items-start sm:items-center">
            <input id="terms-checkbox-2" type="checkbox" value="" className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600" />
            <label for="terms-checkbox-2" className="ms-2 text-sm font-medium text-gray-800 dark:text-gray-300"> I agree with the <a href="#" title="" className="text-primary-700 underline hover:no-underline dark:text-primary-500">Terms and Conditions</a> of use of the Flowbite marketplace </label>
          </div>

          <div className="gap-4 sm:flex sm:items-center">
            <button type="button" className="w-full rounded-lg  border border-gray-200 bg-white px-5  py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700">Return to Shopping</button>

            <button type="submit" className="mt-4 flex w-full items-center justify-center rounded-lg bg-primary-700  px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300  dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 sm:mt-0">Send the order</button>
          </div>
        </div>
      </div>
    </div>
  </form>
</section>
</>
  )
}

export default PaymentPage