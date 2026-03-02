import SongPanel from "@/components/create-song-panel";
import React from "react";

const CreatePage = () => {
  return (
    <div className="bg-muted/30 flex min-h-screen w-full flex-col">
      <div className="flex w-full flex-col items-center justify-center">
        <SongPanel />
      </div>
    </div>
  );
};

export default CreatePage;
