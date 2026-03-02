'use client'
import React from 'react'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Minus, Plus } from 'lucide-react'
import { Switch } from './ui/switch'

const SongPanel = () => {
    const [mode, setMode] = useState<'simple' | 'custom'>('simple')
    const [description, setDescription] = useState<string>('')
    const [Instrumental, setInstrumental] = useState<boolean>(false)
    const [tags, setTags] = useState<string[]>([])
    const [customModeFullyrics, setcustomModeFullLyrics] = useState<boolean>(false)

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

    const handeDescriptionChange = (desc: string) => {
        setDescription(desc)
        let allTags = description.split(',').map(t => t.trim()).filter(t => t.length > 0)
        allTags = allTags.concat(tags)
        allTags = Array.from(new Set(allTags))
        setTags(allTags.filter(t => desc.includes(t)))
    }

    const handleTagClick = (tag: string) => {
        let allTags = description.split(',').map(t => t.trim()).filter(t => t.length > 0)
        allTags = allTags.concat(tags)
        allTags = Array.from(new Set(allTags))
        if (!allTags.includes(tag)) {
            setTags([...tags, tag])
            setDescription(description + `, ${tag}`)
        }
        else {
            let newTags = tags.filter(t => t !== tag)
            setTags(newTags)
            setDescription(description.replace(`, ${tag}`, ''))
        }
    }

    return (
        <div className='flex rounded-lg p-8 w-full max-w-3xl flex-col gap-4'>
            <Tabs defaultValue='simple' value={mode} onValueChange={(m) => setMode(m as 'simple' | 'custom')} className='w-full flex flex-col items-center'>
                <TabsList className="bg-transparent border-b-2 grid grid-cols-2 justify-between w-fit  text-centeritems-center">
                    <TabsTrigger value='simple' className='px-8 font-bold tracking-wide'  >
                        Simple
                    </TabsTrigger>
                    <TabsTrigger value='custom' className='px-8 font-bold tracking-wide'>
                        Custom
                    </TabsTrigger>
                </TabsList>
                <TabsContent value='simple' className='w-full flex flex-col gap-4 mt-4'>
                    <Label className='text-2xl font-black'>
                        Let the vibe be your guide ...

                    </Label>
                    <Textarea value={description} onChange={(desc) => handeDescriptionChange(desc.target.value)} minLength={15} maxLength={400} placeholder='Enter song details here...' className='w-full resize-none ' />
                    <div className="flex justify w-full items-center justify-between">
                        <Button className='flex items-center justify-start w-fit px-8' variant={'outline'} size={'sm'}>
                            <Plus />
                            <p>Tags</p>

                        </Button>
                        <div className="flex items-center gap-x-2">
                            <Label>Instrumental?</Label>
                            <Switch checked={Instrumental} onCheckedChange={(e) => setInstrumental(e)} className='bg-amber-600 w-fit justify-self-end cursor-pointer' />

                        </div>
                    </div>
                    <div className="container w-full space-x-1 space-y-1">
                        {categories.map((cat, index) => <Button onClick={() => handleTagClick(cat)} size={'xs'} key={index} variant={tags.includes(cat) ? 'default' : 'outline'} className='text-xs'>
                            {tags.includes(cat) ? <Minus size='small' /> : <Plus size={'small'} />}
                            {cat}
                        </Button>)}
                    </div>
                </TabsContent>
                <TabsContent value='custom' className='w-full flex flex-col gap-4 mt-4'>
                    <Label className='text-2xl font-black'>Lets get descriptive</Label>
                    <Textarea value={description} onChange={(e) => handeDescriptionChange(e.target.value)} className='resize-none' placeholder='Add a full prompt e.g. 120bpm, 60s rock soul early electric guitar influence'></Textarea>
                    <div className="flex justify-between w-full">
                              <Button size={'sm'} className='flex items-center justify-start w-fit px-8' variant={'outline'}>
                            <Plus />
                            <p>Tags</p>

                        </Button>

                                 <div className="flex items-center gap-x-2">
                            <Label>Instrumental?</Label>
                            <Switch checked={Instrumental} onCheckedChange={(e) => setInstrumental(e)} className='bg-amber-600 w-fit justify-self-end cursor-pointer' />

                        </div>
                    </div>
    
    <div className="container w-full space-x-1 space-y-1">
                        {categories.map((cat, index) => <Button onClick={() => handleTagClick(cat)} size={'xs'} key={index} variant={tags.includes(cat) ? 'default' : 'outline'} className='text-xs'>
                            {tags.includes(cat) ? <Minus size='small' /> : <Plus size={'small'} />}
                            {cat}
                        </Button>)}
                    </div>
                    <div className="w-full flex justify-between">
                        <Label className='text-2xl font-black'>Lyrics</Label>
                        <div className="flex flex-col items-center justify-center">
                            <div className="container">
                                <Button  size={'sm'} variant={customModeFullyrics ? 'ghost' : 'outline'} onClick={() => setcustomModeFullLyrics(false)}>
                                    Auto
                                </Button>
                                <Button size={'sm'} variant={customModeFullyrics ? 'outline' : 'ghost'} onClick={() => setcustomModeFullLyrics(true)}>
                                    Write
                                </Button>
                            </div>
                        </div>

                    </div>

                    <Textarea placeholder={`${customModeFullyrics ? 'Write down the exact lyrics you want, e.g[verse] i want sasv ' : 'Write down the style of lyrics you want'}`} className='resize-none'/>

                </TabsContent>
            </Tabs>
        </div>
    )
}

export default SongPanel