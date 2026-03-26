"use client";
import React from "react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Loader, Minus, Music, Plus } from "lucide-react";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Separator } from '@/components/ui/separator'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "./ui/dialog";
import { Input } from "./ui/input";
import JobsBoard from "./jobsboards";
import { toast } from "sonner";
import { generate } from "@/lib/actions/generation";
import type { GenerationParams } from "@/lib/types/generation-params";
import { time } from "console";
import { Slider } from "./ui/slider";
import { ScrollArea } from "./ui/scroll-area";
import { JobStatus } from "generated/prisma";
import TrackList from "./tracklist";

const SongPanel = () => {
    // Shared components
    const [mode, setMode] = useState<"simple" | "custom">("simple");
    const [description, setDescription] = useState<string>("");
    const [isInstrumental, setIsInstrumental] = useState<boolean>(false);
    const [tags, setTags] = useState<string[]>([]);
    const [customModeFullyrics, setcustomModeFullLyrics] = useState<boolean>(false);
    const [lyrics, setLyrics] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [addingTag, setAddingTag] = useState<boolean>(false)
    const [newTag, setNewTag] = useState<string>('')
    const [title, setTitle] = useState<string>('')
    const [songLength, setSongLength] = useState<number[]>([60, 150])
    const [categories, setCategories] = useState([
        "Retro",
        "80s Funk",
        "Rock",
        "Hip Hop",
        "Jazz",
        "Trap",
        "Psychadelic Rock",
        "Smooth",
        "Cinematic",
    ].map(c => c.toLocaleLowerCase()))
    const [jobs, setJobs] = useState<string[]>([])





    const handeDescriptionChange = (desc: string) => {
        setDescription(desc);
        let allTags = description
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0);
        allTags = allTags.concat(tags).map(c => c.toLocaleLowerCase());
        allTags = Array.from(new Set(allTags));
        setTags(allTags.filter((t) => desc.toLocaleLowerCase().includes(t)));
    };

    const handleTagClick = (tag: string) => {
        let allTags = description
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0);
        allTags = allTags.concat(tags);
        allTags = Array.from(new Set(allTags)).map(c => c.toLocaleLowerCase());
        if (!allTags.includes(tag)) {
            setTags([...tags, tag]);
            setDescription(description + `, ${tag}`);
        } else {
            let newTags = tags.map(c => c.toLocaleLowerCase()).filter((t) => t !== tag);
            setTags(newTags);
            setDescription(description.replace(`, ${tag}`, ""));
        }
    };

    const handleNewTag = (newItem: string) => {

        setCategories(Array.from(new Set(categories.concat([newItem]).map(s => s.toLowerCase()))))
        handleTagClick(newItem)

    }
    const handleTagButtonClick = async () => {
        if (addingTag && newTag) {
            if (newTag.length > 5) {
                handleNewTag(newTag)
                setNewTag('')
            }
            toast('New tag must be at least 5 characters.')
            return
        }
        else {
            setAddingTag(!addingTag)
            console.log(addingTag)
        }
    }

    async function handleSubmitSong(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<any> {

        try {
            setIsLoading(true)
            const params = {
                title: title ? title : (mode === "simple" ? description : tags.join(",")),
                audioDuration: (Math.random() * (songLength[1]! - songLength[0]!)) + songLength[0]!,
                describedLyrics: customModeFullyrics ? null : lyrics,
                fullLyrics: customModeFullyrics ? lyrics : null,
                describedPrompt: tags.join(','),
                fullPrompt: mode === 'custom' ? description : null,
                
            }
            const jobIdA = await generate({...params,
        
                inferStep: Math.random() * 8,
                seed: Math.random() * 4353252,
                guidanceScale: Math.random(),
                instrumental: isInstrumental,
             })

             const jobIdB = await generate({...params,
                inferStep: Math.random() * 8,
                seed: Math.random() * 4353252,
                guidanceScale: Math.random(),
                instrumental: isInstrumental,
             })
             console.log(jobIdA)
             console.log(jobIdB)
             setJobs(jobs.concat([jobIdA, jobIdB]))

             return [jobIdA, jobIdB]
        }
        catch (e) {


        }
        finally {
            setIsLoading(false)
        }
    }

    function hanndleNewTagChange(e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>): void {
        console.log(e)
        setNewTag(e.target.value)
    }

    return (
        <div className="flex flex-1 sm:min-w-lg  border-r bg-muted h-svh px-8 max-w-md flex-col items-center gap-y-4 rounded-r-lg p-8">
            <Tabs
                defaultValue="simple"
                value={mode}
                onValueChange={(m) => setMode(m as "simple" | "custom")}
                className="flex w-full flex-col items-center mx-auto"
            >
                {/* tab triggers */}
                <TabsList className="text-center items-center grid w-fit grid-cols-2 justify-between border-b-2 bg-transparent">
                    <TabsTrigger value="simple" className="px-8 font-bold tracking-wide">
                        Simple
                    </TabsTrigger>
                    <TabsTrigger value="custom" className="px-8 font-bold tracking-wide">
                        Custom
                    </TabsTrigger>
                </TabsList>
                <Input className="max-w-md capitalize my-2 px-1" placeholder="Enter a title here." value={title} onChange={(e) =>  setTitle(e.target.value)}/>
               <div className="flex flex-col items-start w-full gap-y-2">
                 <Slider  min={60} max={180} aria-label="song length (seconds)" value={songLength} onValueChange={setSongLength}/>
                <p className="italic font-light text-xs">Between {songLength[0]} and {songLength[1]} seconds </p>
               </div>
                {/* simple mode tab */}

                <TabsContent value="simple" className="mt-4 flex w-full flex-col gap-y-4 items-center">
                    <Label className="text-2xl font-black self-start">
                        Let the vibe be your guide ...
                    </Label>
                    <Textarea
                        value={description}
                        onChange={(desc) => handeDescriptionChange(desc.target.value)}
                        maxLength={400}
                        placeholder="Enter song details here..."
                        className="w-full resize-none"
                    />
                    <div className="justify flex w-full items-center justify-between">
                        <div className="flex items-center">
                            <Button
                                onClick={() => handleTagButtonClick()}
                                className="flex w-fit items-center justify-start px-8"
                                variant={"outline"}
                                size={"sm"}
                            >

                                <Plus className="h-full py-0 my-0" />

                            </Button>
                            <div
                                className={` transition-all duration-300 ease-in-out ${addingTag ? 'w-fit opacity-100 ml-2' : 'w-0 opacity-0 ml-0'}`}
                            >
                                <Input
                                    autoFocus={true}
                                    value={newTag}
                                    onSubmit={(e) => handleNewTag(e.target.textContent)}
                                    onChange={(e) => hanndleNewTagChange(e)}
                                    placeholder="New tag"
                                    className="p-0 flex w-full font-light italic capitalize px-2"
                                    type="text"
                                >
                                </Input>
                            </div>

                        </div>
                        <div className="flex items-center gap-x-2">
                            <Label>Instrumental?</Label>
                            <Switch
                                checked={isInstrumental}
                                onCheckedChange={(e) => setIsInstrumental(e)}
                                className="w-fit cursor-pointer justify-self-end"
                            />
                        </div>
                    </div>
                    <div className="container w-full space-y-1 space-x-1">
                        {categories.map((cat, index) => (
                            <Button
                                onClick={() => handleTagClick(cat)}
                                size={"xs"}
                                key={index}
                                variant={tags.includes(cat) ? "default" : "outline"}
                                className="capitalize text-xs"
                            >
                                {tags.includes(cat) ? (
                                    <Minus size="small" />
                                ) : (
                                    <Plus size={"small"} />
                                )}
                                {cat}
                            </Button>
                        ))}
                    </div>
                </TabsContent>

                {/* custom mode tab */}

                <TabsContent value="custom" className="mt-4 flex w-full flex-col gap-y-4 items-center">
                    <Label className="text-2xl font-black self-start">Lets get descriptive</Label>
                    <Textarea
                        value={description}
                        onChange={(e) => handeDescriptionChange(e.target.value)}
                        className="resize-none"
                        placeholder="Add a full prompt e.g. 120bpm, 60s rock soul early electric guitar influence"
                    ></Textarea>
                    <div className="flex w-full justify-between">
                        <Button
                            size={"sm"}
                            className="flex w-fit items-center justify-start px-8"
                            variant={"outline"}
                        >
                            <Plus />

                        </Button>

                        <div className="flex items-center gap-x-2">
                            <Label>Instrumental?</Label>
                            <Switch
                                checked={isInstrumental}
                                onCheckedChange={(e) => setIsInstrumental(e)}
                                className="w-fit cursor-pointer justify-self-end bg-amber-600"
                            />
                        </div>
                    </div>

                    <div className="container w-full space-y-1 space-x-1">
                        {categories.map((cat, index) => (
                            <Badge
                                onClick={() => handleTagClick(cat)}
                                variant={!tags.includes(cat) ? 'secondary' : 'default'}
                                key={index}
                                className={`capitalize text-xs cursor-pointer text-black ${!tags.includes(cat) ? 'hover:bg-muted bg-white' : 'hover:bg-gray-500 text-white'}  shadow-2xs transition-all ease-in 3s`}
                            >
                                {tags.includes(cat) ? (
                                    <Minus size="small" />
                                ) : (
                                    <Plus size={"small"} />
                                )}
                                {cat}
                            </Badge>
                        ))}
                    </div>
                    <div className="flex w-full justify-between">
                        <Label className="text-2xl font-black">Lyrics</Label>
                        <div className="flex flex-col items-center justify-center">
                            <div className="container">
                                <Button
                                    size={"sm"}
                                    variant={customModeFullyrics ? "ghost" : "outline"}
                                    onClick={() => setcustomModeFullLyrics(false)}
                                >
                                    Auto
                                </Button>
                                <Button
                                    size={"sm"}
                                    variant={customModeFullyrics ? "outline" : "ghost"}
                                    onClick={() => setcustomModeFullLyrics(true)}
                                >
                                    Write
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Textarea
                        placeholder={`${customModeFullyrics ? "Write down the exact lyrics you want, e.g[verse] i want sasv " : "Write down the style of lyrics you want"}`}
                        className="resize-none"
                    />
                </TabsContent>

             
            </Tabs>

       <Separator className="h-full w-1"/>

          {/* submit */}
                <div className="w-full self-center flex justify-center my-6 mx-auto">
                    <Button onClick={(e) => handleSubmitSong(e)} disabled={isLoading} className="flex-1 max-w-sm self-center flex justify-center items-center gap-x-2 bg-gradient-to-r from-orange-500 to-pink-400 hover:from-pink-500 hover:to-orange-400 font-bold text-lg uppercase transition-colors 1s">
                        {isLoading ? <Loader className="animate-spin" /> : <Music />}
                        <p><span>{isLoading ? 'Loading' : 'create'} </span></p>
                    </Button>

                </div>
       {/* {jobs &&  jobs.length > 0 ?
        <ScrollArea className="max-h-32 w-full rounded-md border">
     <JobsBoard jobs={jobs} />

    </ScrollArea>:
    <></>
 }  */}
        </div>
    );
};

export default SongPanel;
