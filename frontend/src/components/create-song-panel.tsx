'use client'
import React from 'react'
import {useState} from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Plus } from 'lucide-react'
import { Switch } from './ui/switch'

const SongPanel = () => {
    const [mode, setMode] = useState<'simple' | 'custom'>('simple')
    const [description, setDescription] = useState<string>('')
    const [Instrumental, setInstrumental] = useState<boolean>(false)
    const [tags, setTags] = useState<string[]>([])

    const categories = [
        'Retro',
        '80s Funk',
        'Rock',
        'Hip Hop',
        'Jazz',
        'Trap',
        'Psychadelic Rock',
        'Smooth',
        'Cinematic'
    ]
    
  return (
    <div className='flex bg-muted/30 rounded-lg p-8 w-full max-w-3xl flex-col items-center gap-4'>
        <Tabs defaultValue='simple' value={mode} onValueChange={(m) => setMode(m as 'simple' | 'custom')} className='w-full'>
            <TabsList className="bg-transparent border-b-2 w-full justify-start">
                <TabsTrigger value='simple'>
                        Simple
                </TabsTrigger>
                <TabsTrigger value='custom'>
                        Custom
                </TabsTrigger>

         
            </TabsList>

                   <TabsContent value='simple' className='w-full flex flex-col gap-4 mt-4'>
                  
            
                        <Label className='text-2xl font-black'>
                            Let the vibe be your guide ...
                        </Label>
                        <Textarea value={description} onChange={(desc) => setDescription(desc.target.value)} minLength={15} maxLength={400} placeholder='Enter song details here...' className='w-full resize-none ' />
                        <div className="flex justify w-full items-center justify-between">
                            <Button className='flex items-center justify-start w-fit px-8' variant={'outline'}>
                            <Plus/>
                            <p>Tags</p>

                        </Button>
                        <div className="flex items-center gap-x-2">
                            <Label>Instrumental?</Label>
                                                    <Switch checked={Instrumental} onCheckedChange={(e) => setInstrumental(e)}  className='bg-amber-600 w-fit justify-self-end cursor-pointer'/>

                        </div>
                        </div>
                        <div className="container w-full space-x-1 space-y-1">
                            {categories.map((cat, index) => <Button variant={'outline'}>
                                <Plus/>
                                <p>{cat}</p>
                            </Button>)}
                        </div>
                    </TabsContent>
                   <TabsContent value='custom' className='w-full'>
                    </TabsContent>
        </Tabs>
    </div>
  )
}

export default SongPanel