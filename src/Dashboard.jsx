import React from 'react'


const Dashboard = () => {
  return (
    <>


{/* Dashboard Header */}
<div className="flex items-center justify-between dark:bg-gray-700 p-6 rounded shadow-xl w-full">

  {/* Left side: Dashboard title former color: text-gray-800*/}
  <div className="text-2xl font-semibold text-white">Dashboard</div>

  {/* Right side: Filters and buttons */}
  <div className="flex items-center shadow-xl space-x-4">
    <button className="px-3 py-1 text-sm bg-gray-100 rounded">Filters</button>
    <select 
    className="px-2 py-1 text-sm bg-gray-100 shadow-xl rounded"
    >
      <option>Date range</option>
      <option>Weekly</option>
      <option>MTD</option>
      <option>QTD</option>
      <option>YTD</option>
    </select>
    <select className="px-2 py-1 text-sm bg-gray-100 shadow-xl rounded">
      <option className="text-gray-950">All Accounts</option>
    </select>
    <button className="px-3 py-1 text-sm bg-purple-600 text-white hover:bg-purple-900 shadow-xl rounded">
      Import Trades
    </button>
  </div>
</div>

{/* Body */}
<div className='flex gap-8 p-8'>
  <div className='dark:bg-gray-700 p-6 h-40 w-80 rounded shadow-xl'>
    <h1 className='font-sans font-bold text-white'>Win Rate:</h1>
  </div>
  <div className='dark:bg-gray-700 p-6 h-40 w-80 rounded shadow-xl'></div>
  <div className='dark:bg-gray-700 p-6 h-40 w-80 rounded shadow-xl'></div>
</div>

<div className="grid grid-cols-2 gap-8 h-80 w-100 p-8">
  <div className="dark:bg-gray-700 p-6 rounded shadow-xl"></div>
  <div className='dark:bg-gray-700 p-6 rounded shadow-xl'></div>
</div>



    </>
  )
}

export default Dashboard