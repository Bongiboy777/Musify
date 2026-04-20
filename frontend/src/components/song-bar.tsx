'use client'
import { usePlayback } from '@/lib/stores/song'
import React from 'react'





const SongBar = () => {

    const play = usePlayback()
  return (
    <div className='bg-background/40 bg-gradient-to-r from-pink-500 to-amber-500 flex-1 flex w-full text-3xl font-bold z-30 '>
        {play.title}
    </div>
  )
}

export default SongBar