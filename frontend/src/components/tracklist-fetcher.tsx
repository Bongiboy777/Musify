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
import TrackList from './tracklist'

// these are server actions, can only be used in server component, i.e. calling db, getting session.
//this infor can then be passed to the client component, e.g. user id, song url etc.
const TrackListFetcher = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  
  const songs = db.song.findMany({
    where:{
      userId: session?.user.id
    },

  })

  

  const songsWithThumbNails = await Promise.all((await songs).map(async song => {
    let thumbnailUrl: string
    const job = await db.job.findUnique({
      where:{
        id: song.jobId!
      }
    })
    if (song.image_s3_loc){
      thumbnailUrl = await getPresignedUrl(song.image_s3_loc)
    }
    else{
      thumbnailUrl = ""
    }
   return {
    jobStatus: job?.status!,
     thumbnailUrl,
     playUrl: '',
    ...song

   }
  }))

  return songsWithThumbNails

}

const Tracks = async () => {
  return (
          <TrackList trackList={await TrackListFetcher()}/>

  )
}

export default Tracks
