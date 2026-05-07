import { create } from "zustand";

// need to create a global component which will have, title, thumbnail, playback url, and created by


interface TrackInfo{
  title: string;
  thumbnail: string;
  playbackUrl: string;
  createdBy: string;
  duration: number;
}

interface PlayInfo {
  trackInfo: TrackInfo
  setTrack: (trackInfo: TrackInfo) => void
}

const usePlayback = create<PlayInfo>((set) => ({
  trackInfo: {
    title: "",
    thumbnail: "",
    duration: 0, 
    playbackUrl: "",
    createdBy: ""
  },
  setTrack: (trackInfo: TrackInfo) => set({
    trackInfo: trackInfo
  })
}))

export {usePlayback}