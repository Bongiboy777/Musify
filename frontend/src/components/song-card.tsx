import React from 'react'
import {Card, CardHeader, CardAction, CardTitle, CardDescription, CardFooter} from '@/components/ui/card'
import { Button, } from './ui/button'
import { Badge } from './ui/badge'
import type { Song } from 'generated/prisma'
import { getPresignedUrl } from '@/lib/actions/awsclient'
import Image from 'next/image'
import type track from '@/lib/types/track'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Music, Play } from 'lucide-react'



const SongCard = ({song}: {song: track}) => {
  return (
    
     <Dialog>
      
      {/* 1. Clickable Item/Button */}
         <div className="flex items-center gap-2 transition-all 0.8s cursor-pointer">
               <div className="w-fit h-fit aspect-square relative flex items-center justify-center">
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
        
        <div className="flex items-center w-full">
   
      <div className="h-full flex-1 ">
        <p>{song.title}</p>


      </div>
          
          
        </div>
      </DialogTrigger>
         </div>
      
      {/* 2. The Overlay Card */}
      <DialogContent className="sm:max-w-[425px] border-none shadow-lg flex">
    
        <Image
   
        src={song.thumbnailUrl ? song.thumbnailUrl : 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?_=20210521171500'}
        alt="Event cover"
        objectFit={'cover'}
        fill
      />
    <Card className="relative w-full py-8 px-4 flex flex-col justify-start bg-white opacity-95 backdrop-blur-3xl">
     
     
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