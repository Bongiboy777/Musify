"use client";
import React from "react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Minus, Plus } from "lucide-react";
import { Switch } from "./ui/switch";

const SongPanel = () => {
  // Shared components
  const [mode, setMode] = useState<"simple" | "custom">("simple");
  const [description, setDescription] = useState<string>("");
  const [Instrumental, setInstrumental] = useState<boolean>(false);
  const [tags, setTags] = useState<string[]>([]);
  const [customModeFullyrics, setcustomModeFullLyrics] =
    useState<boolean>(false);

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
  ];

  const handeDescriptionChange = (desc: string) => {
    setDescription(desc);
    let allTags = description
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    allTags = allTags.concat(tags);
    allTags = Array.from(new Set(allTags));
    setTags(allTags.filter((t) => desc.includes(t)));
  };

  const handleTagClick = (tag: string) => {
    let allTags = description
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    allTags = allTags.concat(tags);
    allTags = Array.from(new Set(allTags));
    if (!allTags.includes(tag)) {
      setTags([...tags, tag]);
      setDescription(description + `, ${tag}`);
    } else {
      let newTags = tags.filter((t) => t !== tag);
      setTags(newTags);
      setDescription(description.replace(`, ${tag}`, ""));
    }
  };

  return (
    <div className="flex w-full max-w-3xl flex-col gap-4 rounded-lg p-8">
      <Tabs
        defaultValue="simple"
        value={mode}
        onValueChange={(m) => setMode(m as "simple" | "custom")}
        className="flex w-full flex-col items-center"
      >
        {/* tab triggers */}
        <TabsList className="text-centeritems-center grid w-fit grid-cols-2 justify-between border-b-2 bg-transparent">
          <TabsTrigger value="simple" className="px-8 font-bold tracking-wide">
            Simple
          </TabsTrigger>
          <TabsTrigger value="custom" className="px-8 font-bold tracking-wide">
            Custom
          </TabsTrigger>
        </TabsList>

        {/* simple mode tab */}

        <TabsContent value="simple" className="mt-4 flex w-full flex-col gap-4">
          <Label className="text-2xl font-black">
            Let the vibe be your guide ...
          </Label>
          <Textarea
            value={description}
            onChange={(desc) => handeDescriptionChange(desc.target.value)}
            minLength={15}
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
                checked={Instrumental}
                onCheckedChange={(e) => setInstrumental(e)}
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
        <TabsContent value="custom" className="mt-4 flex w-full flex-col gap-4">
          <Label className="text-2xl font-black">Lets get descriptive</Label>
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
                checked={Instrumental}
                onCheckedChange={(e) => setInstrumental(e)}
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
    </div>
  );
};

export default SongPanel;
