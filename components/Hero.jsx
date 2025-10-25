'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from './ui/button'
import React, { useEffect, useRef } from 'react'


/**
 * HeroSection component displays the main landing section of the application.
 *
 * @component
 * @example
 * <HeroSection />
 *
 * @remarks
 * - Displays a large heading and description for the AI-powered finance platform.
 * - Includes two call-to-action buttons: "Get Started" and "Watch Demo" linking to the dashboard.
 * - Shows a hero image that responds to scroll events by toggling a 'scrolled' class.
 * - Uses `useRef` to track the hero image element and `useEffect` to attach a scroll listener.
 *
 * @returns {JSX.Element} The hero section JSX element
 */

const HeroSection = () => {

  const imageRef = useRef()
  // const imageElement = imageRef.current;

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const scrollThreshold = 100

      const el = imageRef.current
      if (!el) return

      if (scrollPosition > scrollThreshold) {
        el.classList.add('scrolled')
      } else {
        el.classList.remove('scrolled')
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])



  return (
    <div className='pb-20 px-4 '>
      <div className='container mx-auto text-center'>
        <h1 className='text-5xl md:text-8xl lg:text-[105px] pb-6 gradient-title'>
          Manage Your Finances <br/> with Intelligence
        </h1>
        <p className='text-xl text-gray-600 mb-8 max-w-2xl mx-auto'>
          An AI-powered financial mamagement platform that helps you track, analyze and optimize your spending with real-time insights.
        </p>
        <div className='flex justify-center space-x-4'>
          <Link href="./dashboard">
            <Button
              size="lg"
              className="px-8 cursor-pointer"
            >
              Get Started
            </Button>
          </Link>

          <Link href="./dashboard" >
            <Button
              size="lg"
              className="px-8 cursor-pointer"
              variant="outline"
            >
              Watch Demo
            </Button>
          </Link>
        </div>
        <div className='hero-image-wrapper'>
          <div ref={imageRef} className='hero-image'>
            <Image
              src="/banner.jpeg"
              width={1280}
              height={720}
              alt='Dashboard Preview'
              className='rounded-lg shadow-2xl border mx-auto'
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroSection