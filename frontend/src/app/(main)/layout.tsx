import SoundBar from '@/components/sound-bar'
import React from 'react'

const MainLayout = ({children}: {children: any}) => {
  return (
    <div id="create-main" className="w-full h-screen flex flex-col items-center overflow-hidden">
        <div className="flex-1 w-full overflow-auto">
          {children}
        </div>
        <div id="soundbar" className='w-full shrink-0'>
            <SoundBar/>
        </div>
    </div>
  )
}

export default MainLayout