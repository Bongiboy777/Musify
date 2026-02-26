import React from 'react'
import { Button } from './ui/button'

const UpgradeButton = () => {
  return (
    <Button className='flex-1 cursor-pointer text-orange-400 bg-transparent border hover:bg-orange-400 hover:text-white font-bold tracking-wide' variant={'outline'} >Upgrade</Button>
  )
}

export default UpgradeButton