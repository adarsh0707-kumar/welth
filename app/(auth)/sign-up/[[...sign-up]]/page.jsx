'use client'

import React from 'react'
import { SignUp } from '@clerk/nextjs'

/**
 * SignUpPage Component
 *
 * This component renders the Clerk `<SignUp />` component, providing a user interface
 * for users to sign up for the application. It is designed to be used as a page in a
 * Next.js application.
 *
 * @component
 * @example
 * // Usage within a Next.js page
 * <SignUpPage />
 *
 * @see {@link https://clerk.com/docs/reference/components/authentication/sign-up} for Clerk's SignUp component documentation.
 */


const Page = () => {
  return (
    <div>
      <SignUp />
    </div>
  )
}

export default Page