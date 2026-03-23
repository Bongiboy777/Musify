import SongPanel from "@/components/create-song-panel";
import TrackListFetcher from "@/components/tracklist-fetcher";
import { Loader2 } from "lucide-react";
import React, { Suspense } from "react";

const CreatePage = () => {
  return (
    <div className="bg-muted/30 flex min-h-screen w-full">
        <SongPanel />
        <div className="w-full h-full flex justify-center items-center px-8 py-4">
        <Suspense fallback={
          <div className="w-full h-full justify-center items-center">
          <Loader2 className="self-center justify-self-center"/>
          </div>
          }>
        
                  <TrackListFetcher/>

        </Suspense>
        </div>
                </div>

   
  );
};

export default CreatePage;
