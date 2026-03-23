'use server'
import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { getSession } from 'better-auth/api'
import { headers } from 'next/headers'
import React from 'react'
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { getPresignedUrl } from '@/lib/actions/awsclient'
import { Button } from './ui/button'
import { Badge } from 'lucide-react'

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
    <div className='w-full bg-amber-400 grid grid-cols-4 gap-4'>
      
      {(await songs).map( async song => (
         <Card className="relative w-full pt-0 flex flex-col justify-start">
      <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
      <img
        src={song.image_s3_loc ? await getPresignedUrl(song.image_s3_loc) : 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg'}
        alt="Event cover"
        className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
      />
      <CardHeader>
        <CardAction>
          {song.instrumental && <Badge variant="secondary">Featured</Badge>}
        </CardAction>
        <CardTitle>{song.title}</CardTitle>
        <CardDescription className='text-sm'>
          {song.describedPrompt}
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button className="" size={'sm'}>Listen</Button>
      </CardFooter>
    </Card>
    
  )

    )}</div>
  )
}

export default TrackListFetcher