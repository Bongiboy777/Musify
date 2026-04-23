'use server'

import { db } from "@/server/db"
import { toast } from "sonner"
import { getPresignedUrl } from "./awsclient"
import { revalidatePath } from "next/cache"
interface TrackInfo{
  title: string;
  thumbnail: string;
  playbackUrl: string;
  createdBy: string;
}

export async function getPlaybackUrl(id: string) : Promise<TrackInfo>{
const song = await db.song.findUnique({
      where:{
        id:id
      },
      include:{
        user:{
            
        }
        
      }
      
    })

    const createdBy = await db.song.findUnique({
        where:{
            id:id
        },
        include:{
            user:{
                select:{
                    name:true
                }
            }
        }
    })

    db.song.update({
        where:{
            id:id
        },
        data:{
            listenCount:{
                increment:1
            }
        }
    })

    if (!song || !song.s3_loc){
      toast('Error: No playback url')
      throw new Error('no s3 location')
    }
    const playbackUrl = await getPresignedUrl(song?.s3_loc!)
    const imgUrl = await getPresignedUrl(song?.image_s3_loc!)
    revalidatePath('/create')
    return {
    title: song.title!,
    thumbnail: imgUrl,
    playbackUrl:playbackUrl,
    createdBy: song?.user.name

    }
}



export async function publishSong(id: string) : Promise<any>{


    await db.song.update({
        where:{
            id:id
        },
        data:{
            
        }
    })
}


export async function renameSong(id: string, newName:string) : Promise<any>{

    await db.song.update({
        where:{
            id:id
        },
        data:{
            title:newName
        }
    })

    revalidatePath('/create')
}


