import React from 'react'

/**
 * MainLayout component provides a consistent layout wrapper for pages.
 * Centers content with top and bottom spacing and a maximum container width.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The content to render inside the layout
 *
 * @returns {JSX.Element} The layout wrapper with children
 *
 * @example
 * <MainLayout>
 *   <h1>Welcome</h1>
 *   <p>This is the main content.</p>
 * </MainLayout>
 */

const MainLayout = ({children}) => {
  return (
    <div className='container mx-auto my-32'>
      {children}
    </div>
  )
}

export default MainLayout;
