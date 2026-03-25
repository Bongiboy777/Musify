"use client";
import { RefreshCcw, Scroll, Search } from "lucide-react";
import React, { useState } from "react";
import { Input } from "./ui/input";
import type { Song } from "generated/prisma";
import { ScrollArea } from "./ui/scroll-area";
import JobsBoard from "./jobsboards";
import SongCard from "./song-card";
import type track from "@/lib/types/track";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

const TrackList = ({ trackList }: { trackList: track[] }) => {
  const [query, setQuery] = useState<string>("");
  // const jobs = trackList.map(t => t.jobId!)
  const filteredItems = trackList.filter(track => track.title?.toLowerCase().includes(query.toLocaleLowerCase().trim()))
  return (
    <div
      id="track-list"
      className="flex h-fit w-full flex-col items-center gap-y-4 overflow-hidden"
    >
      <div className="flex">
         <div
        id="search"
        className="text-muted-foreground mx-2 flex w-60 items-center gap-2 overflow-hidden rounded-lg border-2 px-2"
      >
        <Search size={16} className="m-0 p-0"></Search>
        <Input
          type="text"
          id="search-my-tracks"
          className="text-muted-foreground mx-0 flex w-full items-center justify-start border-none px-0 ring-0! outline-none! focus:ring-0! focus:outline-none!"
          placeholder="Search for a track..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

       
      </div>
         <Button variant={"secondary"}>
          <RefreshCcw/>
          <p>Refresh</p>
        </Button>
      </div>
     
      <ScrollArea
        id="gallery"
        className="flex h-screen w-full flex-col items-start gap-4 space-y-2"
      >
        <div className="h-fit w-full flex-1 gap-10 gap-y-60 p-4">
          {filteredItems.map((track) => (
            <div key={track.id}>
            <SongCard song={track} />
            <div className="my-2"/>
            </div>
            
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TrackList;
