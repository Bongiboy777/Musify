import { MoreHorizontal, Pencil, Download } from 'lucide-react'
import React, { useState } from 'react'
import  { DialogTrigger, DialogContent, DialogTitle , Dialog} from './ui/dialog'
import { DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenu,  } from './ui/dropdown-menu'
import { Input } from './ui/input'
import type track from '@/lib/types/track'
import { Button } from './ui/button'
import { renameSong } from '@/lib/actions/song'

const RenameDialog = ({song}: {song:track}) => {
    const [title, setTitle] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    async function handleSave(){
        setIsLoading(true)
        await renameSong(song.id, title)
        setIsLoading(false)
        setIsOpen(false)
    }

    async function handleCancel(){
        setIsLoading(false)
        setIsOpen(false)
    }
  return (
  
          <Dialog open={isOpen} onOpenChange={() => setIsOpen(!isOpen)}>
            <DialogTrigger  className='flex items-center gap-2' onClick={() => setIsOpen(!isOpen)}>
 <Pencil/> Rename
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>
                Rename {song.title}
              </DialogTitle>
              <Input type='text' placeholder='Enter a new name for this track' value={title} onChange={(e) => setTitle(e.currentTarget.value)}/>
              <div className="flex items-center justify-between">
                <Button variant={'outline'} onClick={handleSave} disabled={isLoading}>
                    Save
                </Button>
                <Button variant={'destructive'} onClick={handleCancel}>
                    Cancel
                </Button>
            </div>
            </DialogContent>
            
          </Dialog>
         
  )
}

export default RenameDialog