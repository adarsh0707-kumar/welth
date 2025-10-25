'use client'

import React from 'react'
import { SignIn } from '@clerk/nextjs'

/**
 * SignInPage Component
 *
 * This component renders the Clerk `<SignIn />` component, providing a user interface
 * for users to sign in to the application. It is designed to be used as a page in a
 * Next.js application.
 *
 * @component
 * @example
 * // Usage within a Next.js page
 * <SignInPage />
 *
 * @see {@link https://clerk.com/docs/reference/components/authentication/sign-in} for Clerk's SignIn component documentation.
 */

const Page = () => {
  return (
    <div>
      <SignIn/>
    </div>
  )
}

export default Page