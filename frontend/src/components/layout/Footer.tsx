const Footer = () => {
  return (
    <footer className='bg-white border-t p-4 text-center text-sm text-gray-500 print:hidden'>
      © {new Date().getFullYear()} Admin Panel. All rights reserved.
    </footer>
  )
}

export default Footer
