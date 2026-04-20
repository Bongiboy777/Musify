'use server'

import { db } from "@/server/db"
import { toast } from "sonner"
import { getPresignedUrl } from "./awsclient"
import { revalidatePath } from "next/cache"


export async function getPlaybackUrl(id: string) : Promise<any>{
const s3Url = await db.song.findUnique({
      where:{
        id:id
      },
      select:{
        id:true,
        s3_loc:true
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

    if (!s3Url || !s3Url.s3_loc){
      toast('Error: No playback url')
      throw new Error('no s3 location')
    }
    const playbackUrl = await getPresignedUrl(s3Url?.s3_loc!)
    revalidatePath('/create')
    return playbackUrl
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


