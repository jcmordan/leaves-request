type Props = {
  title: string
  description?: string
  children: React.ReactNode
}

const PageContainer = ({ title, description, children }: Props) => {
  return (
    <div>
      {title && <h1>{title}</h1>}
      {description && <p>{description}</p>}
      {children}
    </div>
  )
}

export default PageContainer
