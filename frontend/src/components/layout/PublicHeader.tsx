'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSession, signIn } from 'next-auth/react'

import { Button } from '@/components/ui/button'

export const PublicHeader = () => {
  const { status } = useSession()

  const handleSignin = async () => {
    await signIn('keycloak', {
      callbackUrl: '/console',
      redirect: true,
    })
  }

  return (
    <header className='bg-white shadow-sm border-b'>
      <div className='container mx-auto px-4 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-8'>
            <Link href='/' className='text-xl font-bold text-primary'>
              <Image src='/micro-erp-brand.svg' alt='Micro ERP Logo' width={150} height={150} />
            </Link>
            <nav className='hidden md:flex items-center space-x-6'>
              <Link
                href='/'
                className='text-sm font-medium text-gray-700 hover:text-primary transition-colors'
              >
                Home
              </Link>
              <Link
                href='/#features'
                className='text-sm font-medium text-gray-700 hover:text-primary transition-colors'
              >
                Features
              </Link>
              <Link
                href='/#about'
                className='text-sm font-medium text-gray-700 hover:text-primary transition-colors'
              >
                About
              </Link>
              <Link
                href='/#contact'
                className='text-sm font-medium text-gray-700 hover:text-primary transition-colors'
              >
                Contact
              </Link>
            </nav>
          </div>
          <div className='flex items-center space-x-4'>
            {status === 'authenticated' ? (
              <Link href='/console'>
                <Button variant='default'>Go to Console</Button>
              </Link>
            ) : (
              <Button data-testid='login-button' variant='default' onClick={handleSignin}>
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
