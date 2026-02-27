import SongPanel from '@/components/create-song-panel'
import React from 'react'

const CreatePage = () => {
  return (
    <div className='w-full flex flex-col min-h-screen'>
        <div className='w-full flex items-center justify-center py-8'>

             <SongPanel />
        </div>
       
    </div>
  )
}

export default CreatePage