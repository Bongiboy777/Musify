import SongPanel from "@/components/create-song-panel";
import SongBar from "@/components/sound-bar";
import TrackList from "@/components/tracklist";
import TrackListFetcher from "@/components/tracklist-fetcher";
import { Separator } from "@/components/ui/separator";
import { Hand, Loader2 } from "lucide-react";
import React, { Suspense } from "react";

const CreatePage = async () => {
  return (
    <div className="flex max-h-screen flex-1 border-b-lg w-full flex-col md:flex-row">
      <SongPanel />
       

      <div className="w-full flex flex-col justify-center items-center px-8">
      <Suspense fallback={
        <Loader2 className="self-center justify-self-center animate-spin"/>
        }>
      <TrackListFetcher />
      </Suspense>

      </div>

          </div>

   
  );
};

export default CreatePage;
