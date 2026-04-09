'use client'

import { FC } from 'react'

const SplashScreen: FC = () => {
  return (
    <div className='fixed inset-0 z-9999 flex flex-col items-center justify-center bg-background'>
      <div className='relative flex flex-col items-center gap-8'>
        {/* Animated Logo Container */}
        <div className='relative w-24 h-24 flex items-center justify-center rounded-2xl bg-primary/10 animate-in fade-in zoom-in duration-700'>
          <div className='absolute inset-0 border-4 border-primary/20 rounded-2xl animate-pulse' />
          <svg
            className='w-12 h-12 text-primary animate-bounce'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={2}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
            />
          </svg>
        </div>

        <div className='flex flex-col items-center gap-2'>
          <h1 className='text-2xl font-bold tracking-tight text-foreground animate-in slide-in-from-bottom duration-700 delay-150'>
            Micro ERP
          </h1>
          <div className='flex items-center gap-2'>
            <div className='h-1 w-12 bg-primary/20 rounded-full overflow-hidden'>
              <div className='h-full w-full bg-primary origin-left animate-progress' />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% {
            transform: scaleX(0);
          }
          50% {
            transform: scaleX(0.7);
          }
          100% {
            transform: scaleX(1);
          }
        }
        .animate-progress {
          animation: progress 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  )
}

export default SplashScreen
