import { create } from "zustand";

// need to create a global component which will have, title, thumbnail, playback url, and created by

interface PlayInfo {
  title: string;
  thumbnail: string;
  playbackUrl: string;
  createdBy: string;
}

const usePlayback = create<PlayInfo>((set) => ({
  createdBy: "",
  playbackUrl: "",
  thumbnail: "",
  title: "",

  setPlayUrl: (url: string) => set((state) => ({ playbackUrl: url })),
  setTitle: (title: string) => set((state) => ({ title: title })),
  setThumbnail: (url: string) => set((state) => ({ thumbnail: url })),
  setCreatedBy: (createdBy: string) => set((state) => ({ createdBy: createdBy })),
}));

export {usePlayback}