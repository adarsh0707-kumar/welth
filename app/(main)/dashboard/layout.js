import DashboardPage from './page';
import React, { Suspense } from 'react'
import { BarLoader } from 'react-spinners'

/**
 * DashboardLayout component renders the main dashboard layout,
 * including the page title and the dashboard page content.
 *
 * Utilizes React Suspense to handle lazy loading of the DashboardPage component,
 * displaying a BarLoader spinner as a fallback during the loading process.
 *
 * @component
 * @example
 * // Example usage:
 * <DashboardLayout />
 *
 * @returns {JSX.Element} The rendered dashboard layout.
 */


const DashboardLayout = () => {
  return (
    <div className='px-5'>
      <h1 className='text-6xl font-bold gradient-title mb-5'>Dashboard</h1>
      
      <Suspense fallback={<BarLoader className='mt-4' width={"100%"} color='#9333ea'/>}>
        <DashboardPage />
      </Suspense>

    </div>
  )
}

export default DashboardLayout;
