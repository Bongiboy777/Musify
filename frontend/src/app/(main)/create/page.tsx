import SongPanel from "@/components/create-song-panel";
import TrackList from "@/components/tracklist";
import TrackListFetcher from "@/components/tracklist-fetcher";
import { Separator } from "@/components/ui/separator";
import { Hand, Loader2 } from "lucide-react";
import React, { Suspense } from "react";

const CreatePage = async () => {
const trackList = TrackListFetcher()
  return (
    <div className="flex flex-1 h-fit border-b-lg w-full flex-col md:flex-row">
      <SongPanel />
       
       
      <div className="w-full h-full flex flex-col justify-center items-center px-8 py-4">
      <Suspense fallback={
        <div className="w-full h-full bg-amber-500 justify-center items-center">
        <Loader2 className="self-center justify-self-center animate-spin"/>
        </div>
        }>
      <TrackList trackList={await trackList}/>

      </Suspense>
      </div>
          </div>

   
  );
};

export default CreatePage;
