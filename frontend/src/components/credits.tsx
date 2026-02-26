import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { headers } from 'next/headers'
import React from 'react'

const Credits = async () => {
  const authHeaders = await headers();
  const session = await auth.api.getSession(
    {

      headers: authHeaders
    }
  )

  const credits = await db.user.findUnique({
    where: {
      id: session!.user.id
    },
     select: {
      credits: true
     }
  })


  return (
    <div>{credits ? <>{credits.credits}<span className='text-slate-300 italic font-light'>Credits</span> </> : "No credits found"}</div>
  )

}

export default Credits