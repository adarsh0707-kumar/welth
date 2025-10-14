'use client'
import React from 'react'

const AuthLayout = ({children}) => {
  return (
    <div className='flex justify-center pt-40 items-center'>
      {children}
    </div>
  )
}

export default AuthLayout