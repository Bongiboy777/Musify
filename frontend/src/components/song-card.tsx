import React from 'react'
import {Card, CardHeader, CardAction, CardTitle, CardDescription, CardFooter} from '@/components/ui/card'
import { Button, } from './ui/button'
import { Badge } from './ui/badge'
import type { Song } from 'generated/prisma'
import { getPresignedUrl } from '@/lib/actions/awsclient'
import Image from 'next/image'
import type track from '@/lib/types/track'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Loader2, Music, Play, Verified } from 'lucide-react'
import { jobRouter } from '@/server/api/routers/job'



const SongCard = ({song}: {song: track}) => {
  return (
    
     <Dialog>
      
      {/* 1. Clickable Item/Button */}
         <div className="flex items-center gap-2 min-w-0 w-full transition-all cursor-pointer">
               <div className="w-16 h-16 shrink-0 aspect-square relative flex items-center justify-center">
                      <Play size={'32px'} className='items-center text-center opacity-100 absolute self-center align-middle'/>

                <Image
        width={256}
        height={256}
        src={song.thumbnailUrl ? song.thumbnailUrl : 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?_=20210521171500'}
        alt="Event cover"
        className="w-16 h-16 aspect-square rounded-md hover:bg-white hover:opacity-40 z-10  hover:scale-[101%] translate-0 hover:translate-0"
      />
               </div>

               <DialogHeader>
                <DialogTitle>

                </DialogTitle>
                <DialogDescription>
                  
                </DialogDescription>
               </DialogHeader>
      <DialogTrigger asChild>
        
        <div className="flex items-center min-w-0 flex-1">
   
      <div className="h-full min-w-0 flex-1">
        <Badge className={`${song.jobStatus === "COMPLETED" ? 'bg-green-700' : song.jobStatus === "FAILED" ? 'bg-red-700' : 'bg-amber-500'} flex items-center gap-x-2 `} color={song.jobStatus === "COMPLETED" ? 'green' : 'red'}>
        {song.jobStatus != "COMPLETED" ? <Loader2 className='animate-spin'/> : <Verified/> }
        <div className="font-bold text-xs">
          {song.jobStatus}
        </div>

        </Badge>
        <p className="truncate max-w-[280px] text-sm font-medium">{song.title}</p>


      </div>
          
          
        </div>
      </DialogTrigger>
         </div>
      
      {/* 2. The Overlay Card */}
      <DialogContent className="sm:max-w-[425px] border-none shadow-lg flex rounded-lg">
    
        <Image
   
        src={song.thumbnailUrl ? song.thumbnailUrl : 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?_=20210521171500'}
        alt="Event cover"
        objectFit={'cover'}
        fill
      />
    <Card className="relative rounded-lg w-full py-8 px-4 flex flex-col justify-start bg-white opacity-95 backdrop-blur-3xl">
     
     
     <CardHeader>
       <CardAction>
      {song.instrumental && <Badge  className='flex items-center' variant="secondary"><Music/><p>Instrumental</p></Badge>}
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
            </DialogContent>

            </Dialog>

  )
}

export default SongCard