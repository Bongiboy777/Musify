import SoundBar from '@/components/sound-bar'
import React from 'react'

const MainLayout = ({children}: {children: any}) => {
  return (
    <div id="create-main" className="w-full h-screen flex flex-col justify-between items-center">
        {children}
        <div id="soundbar" className='w-full flex flex-1 items-center sticky bottom-0 absolute rigt-0'>
            <SoundBar/>
        </div>
    </div>
  )
}

export default MainLayout