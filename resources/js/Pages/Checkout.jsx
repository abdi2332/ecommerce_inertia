import React, { useState } from "react";
import Footer from "@/Layouts/Footer";
import Chapaimage from '../../../public/assets/images/chapa/images.jpeg'
import { useForm } from "@inertiajs/react";
import { useCart } from "./components/CartProvider";

const Checkout = ({ totalCost }) => {
    const {cart} = useCart();
   const { data, setData, post, processing, errors } = useForm({
    full_name: "",
    email: "",
    phone: "",
    city: "Yeka",
    address_line: "",
    region: "",
    payment_method: "chapa",
  });

 
  console.log(data)

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('checkout.store'));
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(name, value);



    // post(route('checkout.store'), {
    //   onSuccess: (page) => {

    //     // Inertia.visit(route('order.success')); 
  
    //   },
    // });

  };

  return (
    <>
    <section className="bg-white py-8 antialiased dark:bg-gray-800 md:py-16">
      <form onSubmit={handleSubmit} className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <ol className="items-center flex w-full max-w-2xl text-center text-sm font-medium text-gray-500 dark:text-gray-400 sm:text-base">
          <li className="after:border-1 flex items-center text-primary-700 after:mx-6 after:hidden after:h-1 after:w-full after:border-b after:border-gray-200 dark:text-primary-500 dark:after:border-gray-700 sm:after:inline-block sm:after:content-[''] md:w-full xl:after:mx-10">
            <span className="flex items-center after:mx-2 after:text-gray-200 after:content-['/'] dark:after:text-gray-500 sm:after:hidden">
              <svg
                className="me-2 h-4 w-4 sm:h-5 sm:w-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              Cart
            </span>
          </li>

          <li className="after:border-1 flex items-center text-primary-700 after:mx-6 after:hidden after:h-1 after:w-full after:border-b after:border-gray-200 dark:text-primary-500 dark:after:border-gray-700 sm:after:inline-block sm:after:content-[''] md:w-full xl:after:mx-10">
            <span className="flex items-center after:mx-2 after:text-gray-200 after:content-['/'] dark:after:text-gray-500 sm:after:hidden">
              <svg
                className="me-2 h-4 w-4 sm:h-5 sm:w-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              Checkout
            </span>
          </li>

          <li className="flex shrink-0 items-center">
            <svg
              className="me-2 h-4 w-4 sm:h-5 sm:w-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            Order summary
          </li>
        </ol>

        <div className="mt-6 sm:mt-8 lg:flex lg:items-start lg:gap-12 xl:gap-16">
          <div className="min-w-0 flex-1 space-y-8">
            {/* Delivery Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Delivery Details
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="full_name"
                    className="mb-2 block text-sm font-medium text-gray-800 dark:text-white"
                  >
                    Your name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={data.full_name}
                    onChange={handleChange}
                    placeholder="Bonnie Green"
                    required
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-800 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                  />
                   {errors.name && <div>{errors.name}</div>}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-800 dark:text-white"
                  >
                    Your email*
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={data.email}
                    onChange={handleChange}
                    placeholder="name@flowbite.com"
                    required
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-800 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                  />
                   {errors.name && <div>{errors.name}</div>}
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="mb-2 block text-sm font-medium text-gray-800 dark:text-white"
                  >
                    City*
                  </label>
                  <select
                    id="city"
                    name="city"
                    value={data.city}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-800 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                  >
                    <option value="Yeka">Yeka</option>
                    <option value="Gulele">Gulele</option>
                    <option value="Kotebe">Kotebe</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-gray-800 dark:text-white"
                  >
                    Phone Number*
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={data.phone}
                    onChange={handleChange}
                    placeholder="+251973148191"
                    required
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-800 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                  />
                   {errors.name && <div>{errors.name}</div>}
                </div>

                <div>
                  <label
                    htmlFor="region"
                    className="mb-2 block text-sm font-medium text-gray-800 dark:text-white"
                  >
                    Region
                  </label>
                  <input
                    type="text"
                    id="region"
                    name="region"
                    value={data.region}
                    onChange={handleChange}
                    placeholder="hawassa"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-800 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                  />
                   {errors.name && <div>{errors.name}</div>}
                </div>

                <div>
                  <label
                    htmlFor="address_line"
                    className="mb-2 block text-sm font-medium text-gray-800 dark:text-white"
                  >
                   Address
                  </label>
                  <input
                    type="text"
                    id="address_line"
                    name="address_line"
                    value={data.address_line}
                    onChange={handleChange}
                    placeholder="yeka kotebe"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-800 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                  />
                   {errors.name && <div>{errors.name}</div>}
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Payment
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Chapa */}
                <label className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800 cursor-pointer">
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="payment_method"
                      value="chapa"
                      checked={data.payment_method === "chapa"}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-600"
                    />
                     {errors.name && <div>{errors.name}</div>}
                    <div className="ms-4 text-sm">
                      <span className="font-medium leading-none text-gray-800 dark:text-white">
                        Pay with Chapa
                      </span>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Secure local payment powered by Chapa
                      </p>
                      <img
                        src={Chapaimage}
                        alt="Chapa"
                        className="h-6 mt-2"
                      />
                    </div>
                  </div>
                </label>

                {/* Pay on delivery */}
                <label className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800 cursor-pointer">
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="payment_method"
                      value="delivery"
                      checked={data.payment_method === "delivery"}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-600"
                    />
                    <div className="ms-4 text-sm">
                      <span className="font-medium leading-none text-gray-800 dark:text-white">
                        Pay on Delivery
                      </span>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Pay cash when your order arrives
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Voucher */}
            <div>
              <label
                htmlFor="voucher"
                className="mb-2 block text-sm font-medium text-gray-800 dark:text-white"
              >
                Enter a gift card, voucher or promotional code
              </label>
              <div className="flex max-w-md items-center gap-4">
                <input
                  type="text"
                  id="voucher"
                  name="voucher"
                  value={data.voucher}
                  onChange={handleChange}
                  placeholder=""
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-800 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                />
                <button
                  type="button"
                  className="flex items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-6 w-full space-y-6 sm:mt-8 lg:mt-0 lg:max-w-xs xl:max-w-md">
            <div className="flow-root">
              <div className="-my-3 divide-y divide-gray-200 dark:divide-gray-800">
                <dl className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                    Subtotal
                  </dt>
                  <dd className="text-base font-medium text-gray-800 dark:text-white">
                    {totalCost.subtotal.toFixed(3)}
                  </dd>
                </dl>

                <dl className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                    Payment Fee
                  </dt>
                  <dd className="text-base font-medium text-green-500">
                    {totalCost.payment_fee}
                  </dd>
                </dl>

                <dl className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                    Delivery Fee
                  </dt>
                  <dd className="text-base font-medium text-gray-800 dark:text-white">
                    {totalCost.shipping_fee}
                  </dd>
                </dl>

                <dl className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                    Tax
                  </dt>
                  <dd className="text-base font-medium text-gray-800 dark:text-white">
                    {totalCost.tax.toFixed(3)}
                  </dd>
                </dl>

                <dl className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-base font-bold text-gray-800 dark:text-white">
                    Total
                  </dt>
                  <dd className="text-base font-bold text-gray-800 dark:text-white">
                    {totalCost.total.toFixed(3)}
                  </dd>
                </dl>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4  focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                
              >
                Proceed to Payment
              </button>

              <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                One or more items in your cart require an account.{" "}
                <a
                  href="#"
                  className="font-medium text-primary-700 underline hover:no-underline dark:text-primary-500"
                >
                  Sign in or create an account now.
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </form>
    </section>
  <Footer />
  </>
  );
};

export default Checkout;
