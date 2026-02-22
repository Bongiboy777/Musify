'use client'
import React from 'react'
import { Button } from './ui/button'
import { title } from 'process';
import type { GenerationParams } from '@/lib/types/generation-params';
import { db } from '@/server/db';
import { jobRouter } from '@/server/api/routers/job';
import { api } from '@/trpc/react';
import { JobStatus } from 'generated/prisma';

const C = ({ userId }: { userId: string }) => {
    const [data, setData] = React.useState<any>(null);
    const [jobMessage, setJobMessage] = React.useState<string>(""); 

    const jobData = api.jobs.jobStatus.useQuery(
        { jobId: data?.eventId ?? "" },
        {
            enabled: !!data?.eventId,
            refetchInterval: (query) =>
                query.state.data?.status === JobStatus.COMPLETED ||
                query.state.data?.status === JobStatus.FAILED
                    ? false
                    : 2000,
        }
    );

    React.useEffect(() => {
        if (jobData?.data && jobData.data.status) {
            setJobMessage(jobData.data.status);
        }
    }, [jobData?.data]);

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
        console.log("Data received from API:", data);
        if (data && data.eventId) {
            setData(data);
        }
        return data;
      }

      const handleClick = async (e: any) => {
        e.preventDefault();
        await requestGeneration();
      }

  return (
    <Button onClick={handleClick}>{jobMessage || 'Click me'}</Button>
  )
}

export default C