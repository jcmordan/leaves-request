import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'

type Props = {
  title: string
  subtitle: string
  description: string
  className?: string
}

const LoadingCard = ({ title, subtitle, description, className }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <LoadingSkeleton description={description} className={className} />
      </CardContent>
    </Card>
  )
}

export const LoadingSkeleton = ({
  description,
  className,
}: {
  description: string
  className?: string
}) => {
  return (
    <div
      data-testid='loading-card'
      className={`flex w-full h-full justify-center items-center ${className}`}
    >
      <div className='animate-pulse flex flex-col w-90 '>
        <div className='h-4 bg-gray-200 rounded w-3/4 mb-2' />
        <div className='h-4 bg-gray-200 rounded w-1/2 mb-2' />
        <div className='h-4 bg-gray-200 rounded w-2/3 mb-2' />
        <div className='h-4 bg-gray-200 rounded w-1/3' />
        <p className='text-gray-500 text-sm'>{description}</p>
      </div>
    </div>
  )
}

export default LoadingCard
