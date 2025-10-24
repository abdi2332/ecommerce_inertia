import React from 'react'
import { RefinementList, RangeInput, useNumericMenu } from 'react-instantsearch';

const priceRanges = [
  { label: 'All', start: 0 },
  { label: 'Under $100', end: 100 },
  { label: 'Under $500', end: 500 },
  { label: 'Under $750', end: 750 },
  { label: 'Above $1000', start: 1000 },
];
const SidebarFilter = () => {


  const { items, refine } = useNumericMenu({
    attribute: 'price',
    items: priceRanges,
  });

  const handleChange = (value) => {
    refine({
      filters: value || '', // Typesense filter_by
    });
  };


  return (


    <aside className=" lg:w-60 shrink-0 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:block max-h-fit">
      <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
        Filters
      </h2>

      {/* Category Filter */}
      <div className='flex md:gap-20 gap-10 lg:block'>
      <div className="mb-5">
        <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Category
        </h3>



        <RefinementList
          attribute="category"
          classNames={{
            list: "max-h-40 space-y-2 overflow-y-auto pr-6",
            item: "flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400",
            label: "flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400",
            checkbox: "h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500",
            noResults: "text-xs text-gray-500 dark:text-gray-400",
          }}
        />




      </div>
      <div className="mb-5">
        <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Price
        </h3>
        <ul className="max-h-40 space-y-2 overflow-y-auto pr-1">
          {items.map((item) => (
            <li key={item.label}>
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <input
                  type="radio"
                  name="price"
                  checked={item.isRefined}
                  onChange={() => refine(item.value)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                {item.label}
              </label>
            </li>
          ))}
        </ul>
      </div>
      </div>
    </aside>

  )
}

export default SidebarFilter