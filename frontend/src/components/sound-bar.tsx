'use client'
import { usePlayback } from '@/lib/stores/song'
import React, { useState } from 'react'
import { Slider } from './ui/slider'
import { ArrowBigLeft, ArrowBigRight, MoveLeft, MoveRightIcon, Music, Play } from 'lucide-react'



const SoundBar = () => {

    const {trackInfo} = usePlayback()
    const [position, setPosition] = useState([0])
  return (
    <div className='flex-end bg-background/40 bg-gradient-to-r from-pink-300 to-red-300 rounded-sm border-t flex-1 flex w-full text-3xl font-bold z-30 justify-center text-center items-center'>
      
       <div id="player-image" className='aspect-square items-center p-0 m-0 border-r w-16 flex text-center justify-center'>
        {trackInfo.thumbnail ? <img src={trackInfo.thumbnail}/> : <Music className='text-white flex items-center justify-center flex-1 w-full'/>}
       </div>
       <div id="player-title" className='pl-2'>
            <div id="player-track-info" className='flex flex-col items-start justify-center h-full gap-0 space-y-0'>
              <h2 className="text-2xl flex items-center">
              {trackInfo?.title}
            </h2>
            <p className="italic text-muted-foreground capitalize text-sm">
              {trackInfo?.createdBy}
            </p>
            </div>

      
       </div>
       <div id="player-controls" className='flex items-center mx-2 space-x-2'>
          <ArrowBigLeft/>
          <Play/>
          <ArrowBigRight/>
       </div>
      
       <div id="player-tracking" className='flex-1 mx-8 px-8'>
              <Slider className='relative' defaultValue={[0]} max={100} min={0} step={1} value={position} onValueChange={(e) => setPosition(e) }>
                
                </Slider>
            </div>
    </div>
  )
}

export default SoundBar