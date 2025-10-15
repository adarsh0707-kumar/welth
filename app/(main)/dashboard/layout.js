import React, { Suspense } from 'react'
import DashboardPage from './page';

const DashboardLayout = () => {
  return (
    <div className='px-5'>
      <h1 className='text-6xl font-bold gradient-title mb-5'>Dashboard</h1>
      
      <Suspense fallback={}>
        <DashboardPage />
      </Suspense>

    </div>
  )
}

export default DashboardLayout;