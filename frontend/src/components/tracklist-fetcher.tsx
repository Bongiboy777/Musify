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
import SongCard from './song-card'

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

  const songsWithThumbNails = await Promise.all((await songs).map(async song => {
    let thumbnailUrl: string
    if (song.image_s3_loc){
      thumbnailUrl = await getPresignedUrl(song.image_s3_loc)
    }
    else{
      thumbnailUrl = ""
    }
   return {
     thumbnailUrl,
     playUrl: '',
    ...song

   }
  }))

  return songsWithThumbNails
  

}

export default TrackListFetcher