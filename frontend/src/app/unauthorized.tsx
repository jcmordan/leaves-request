import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function UnauthorizedPage() {
  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
      <Card className='p-8 max-w-2xl bg-warning-soft text-fg-warning'>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            <p className='text-gray-600 text-lg'>
              You do not have the required permissions to access this page. If you believe this is
              an error, please contact your administrator.
            </p>

            <div className='flex justify-center pt-4'>
              <Button render={<Link href='/console' />}>
                Return to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
