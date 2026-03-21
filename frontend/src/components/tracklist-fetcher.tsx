'use server'
import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { getSession } from 'better-auth/api'
import { headers } from 'next/headers'
import React from 'react'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'

const TrackListFetcher = async () => {
  await new Promise(resolve => setTimeout(resolve, 5000))
  const session = await auth.api.getSession({
    headers: await headers()
  })


  const songs = db.song.findMany({
    where:{
      userId: session?.user.id
    }
  })
  
  return (
    <div className='grid grid-cols-4 gap-4 '>{(await songs).map(song => (<Card className='overflow-x-hidden max-h-[100px] px-2 cursor-pointer hover:scale-105 transition-all 1s ease-in opacity-60 bg-slate-400 hover:bg-slate-600 hover:opacity-100'>
      <CardHeader className='p-0 m-0'>
        <CardTitle className='font-bold capitalize flex justify-between'>
          {song.title ? song.title : 'No title'}
          <p className='italic text-xs font-light'>{`${song.audioDuration.toFixed(2)}`} s</p>
        </CardTitle>
      </CardHeader>
      <CardDescription>
      {song.describedPrompt}
      </CardDescription>
      <CardFooter>
        {song.instrumental}
      </CardFooter>
    </Card>)

    )}</div>
  )
}

export default TrackListFetcher