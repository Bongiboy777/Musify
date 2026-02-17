'use client'
import React from 'react'
import { Button } from './ui/button'
import { title } from 'process';
import type { GenerationParams } from '@/lib/types/generation-params';
import { db } from '@/server/db';

const C = ({ userId }: { userId: string }) => {
    const [data, setData] = React.useState<any>(null);
   

    if (data){
        console.log("Data received from API:", data);
    }

    const requestGeneration = async () => {
        const songParams: GenerationParams =  {
                title: 'song title',
              describedPrompt: 'song prompt',
              describedLyrics: 'song lyrics',
              audioDuration: 30,
              inferStep: 20,
              guidanceScale: 7.5,
            instrumental: false,
            userId: userId,
            seed: null,
            fullPrompt: null,
            fullLyrics: null,

            }
        const res = await fetch('http://localhost:3000/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            songParams: songParams
          }),
        });
        const data = await res.json();
        
        setData(data);
        return data;
      }

      const handleClick = async (e: any) => {
        e.preventDefault();
        await requestGeneration();
      }

  return (
    <Button onClick={handleClick}>{data && data.success ? data.song.title : 'Click me'}</Button>
  )
}

export default C