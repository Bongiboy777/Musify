import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { headers } from 'next/headers'
import React from 'react'

const Credits = async ({credits}: {credits: number}) => {



  return (
    <p className='font-semibold'>{credits}<span className='text-muted-foreground italic font-light'>Credits</span></p>
  )

}

export default Credits