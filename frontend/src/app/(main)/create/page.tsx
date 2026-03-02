import SongPanel from '@/components/create-song-panel'
import React from 'react'

const CreatePage = () => {
  return (
    <div className='bg-muted/30  w-full flex flex-col min-h-screen'>
        <div className='w-full flex flex-col items-center justify-center'>

             <SongPanel />
        </div>
       
    </div>
  )
}

export default CreatePage