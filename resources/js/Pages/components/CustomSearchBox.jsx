import { useSearchBox } from  'react-instantsearch';
import { useState } from 'react';

const CustomSearchBox = () => {
  const { query, refine } = useSearchBox();
  const [inputValue, setInputValue] = useState(query || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    refine(inputValue);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-full mx-auto my-4">
      <div className="relative">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
          </svg>
        </div>
        <input
          type="search"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search items"
        />
        <button type="submit" className="absolute end-2.5 bottom-2.5 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800">
          Search
        </button>
      </div>
    </form>
  );
};

export default CustomSearchBox;
