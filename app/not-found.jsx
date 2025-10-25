import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

/**
 * NotFound component displays a 404 error page when a route is not found.
 *
 * @component
 * @example
 * <NotFound />
 *
 * @returns {JSX.Element} A full-page 404 message with a link to return home
 *
 * @remarks
 * - Uses Next.js `Link` component to navigate back to the home page.
 * - Uses a custom `Button` component for navigation.
 * - Centers content vertically and horizontally with responsive padding.
 */

const NotFound = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen px-4 text-center'>
      <h1 className='text-6xl font-bold gradient-title mb-4'>404</h1>
      <h2 className='text-2xl fort-semibold mb-4'>Page Not Found</h2>
      <p className='text-gray-600'>
        Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/">
        <Button className="cursor-pointer mt-8">Return Home</Button>
      </Link>
    </div>
  )
}

export default NotFound