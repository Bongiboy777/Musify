import SongPanel from "@/components/create-song-panel";
import SongBar from "@/components/sound-bar";
import TrackList from "@/components/tracklist";
import TrackListFetcher from "@/components/tracklist-fetcher";
import { Separator } from "@/components/ui/separator";
import { Hand, Loader2 } from "lucide-react";
import React, { Suspense } from "react";

const CreatePage = async () => {
  return (
    <div className="flex min-h-0 flex-1 border-b-lg w-full flex-col md:flex-row overflow-auto">
      <SongPanel />
       

      <div className="w-full flex flex-col justify-start items-stretch overflow-hidden px-4 md:px-8 py-4">
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
