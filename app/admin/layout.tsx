import LeftSidebar from '@/components/admin-dashboard/left-sidebar'
import React from 'react'

const layout = ({children}: {children: React.ReactNode}) => {
  return (
    <div className="min-h-screen w-full">
  <div className="flex">
    <LeftSidebar />

    <div className="flex-1">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {children}
      </div>
    </div>
  </div>
</div>
  )
}

export default layout