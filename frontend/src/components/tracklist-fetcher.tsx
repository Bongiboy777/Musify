import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { headers } from "next/headers";
import { getPresignedUrl } from "@/lib/actions/awsclient";
import TrackList from "./tracklist";

// these are server actions, can only be used in server component, i.e. calling db, getting session.
//this infor can then be passed to the client component, e.g. user id, song url etc.
const TrackListFetcher = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const songs = await db.song.findMany({
    where: {
      userId: session?.user.id,
    },
  });

  const jobIds = songs
    .map((song) => song.jobId)
    .filter((jobId): jobId is string => typeof jobId === "string" && jobId.length > 0);

  const jobs =
    jobIds.length > 0
      ? await db.job.findMany({
          where: {
            id: {
              in: jobIds,
            },
          },
          select: {
            id: true,
            status: true,
          },
        })
      : [];

  const statusByJobId = new Map(jobs.map((job) => [job.id, job.status]));

  const songsWithThumbNails = await Promise.all(
    songs.map(async (song, idx) => {
      let thumbnailUrl: string | null = null;

      if (song.image_s3_loc) {
        try {
          thumbnailUrl = await getPresignedUrl(song.image_s3_loc);
        } catch (e) {
          console.error(`Error getting thumbnail for ${song.title}\n${e}`);
        }
      }

      const jobStatus = song.jobId
        ? (statusByJobId.get(song.jobId) ?? "FAILED")
        : "FAILED";

      return {
        jobStatus,
        thumbnailUrl,
        playUrl: null,
        ...song,
      };
    }),
  );

  return songsWithThumbNails;
};

const Tracks = async () => {
  return <TrackList trackList={await TrackListFetcher()} />;
};

export default Tracks;
