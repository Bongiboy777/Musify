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
import { Separator } from "radix-ui";

const SongPanel = () => {
  // Shared components
  const [mode, setMode] = useState<"simple" | "custom">("simple");
  const [description, setDescription] = useState<string>("");
  const [isInstrumental, setIsInstrumental] = useState<boolean>(false);
  const [tags, setTags] = useState<string[]>([]);
  const [customModeFullyrics, setcustomModeFullLyrics] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false)
  setInterval(() => {setIsLoading(false)}, 5000)

  const categories = [
    "Retro",
    "80s Funk",
    "Rock",
    "Hip Hop",
    "Jazz",
    "Trap",
    "Psychadelic Rock",
    "Smooth",
    "Cinematic",
  ].map(c => c.toLocaleLowerCase());

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

    async function handleSubmitSong(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<any> {
        setIsLoading(true);
        const res = fetch('api/generate', { method: 'POST' });
        await new Promise(resolve => setTimeout(resolve, 4000));
    }

  return (
    <div className="flex border-r bg-muted h-svh w-fit px-8 max-w-md flex-col items-center gap-y-4 rounded-lg p-8">
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
            <Button
              className="flex w-fit items-center justify-start px-8"
              variant={"outline"}
              size={"sm"}
            >
              <Plus />
              <p>Tags</p>
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
              <Button
                onClick={() => handleTagClick(cat)}
                size={"xs"}
                key={index}
                variant={tags.includes(cat) ? "default" : "outline"}
                className="text-xs"
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
              <p>Tags</p>
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
                className={`text-xs cursor-pointer text-black ${!tags.includes(cat) ? 'hover:bg-muted bg-white' : 'hover:bg-gray-500 text-white'}  shadow-2xs transition-all ease-in 3s`}
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

        {/* submit */}
        <div className="w-full self-center flex justify-center my-6 mx-auto">
         <Button onClick={(e) => handleSubmitSong(e)} disabled={isLoading} className="flex-1 max-w-sm self-center flex justify-center items-center gap-x-2 bg-gradient-to-r from-orange-500 to-pink-400 hover:from-pink-500 hover:to-orange-400 font-bold text-lg uppercase transition-colors 1s">
            {isLoading ? <Loader className="animate-spin"/> : <Music/>}
            <p><span>{isLoading ? 'Loading' : 'create'} </span></p>
         </Button>

        </div>
      </Tabs>
    </div>
  );
};

export default SongPanel;
