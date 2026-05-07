'use client'
import { usePlayback } from '@/lib/stores/song'
import React, { useEffect, useRef, useState } from 'react'
import { Slider } from './ui/slider'
import { ArrowBigLeft, ArrowBigRight, Music, Pause, Play, Volume, Volume2, VolumeIcon, VolumeOff } from 'lucide-react'

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const SoundBar = () => {
  const { trackInfo } = usePlayback()
  const [position, setPosition] = useState([0])
  const [playing, setPlaying] = useState(true)
  const [volume, setVolume] = useState([80])
  const [muted, setMuted] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0]! / 100
      audioRef.current.muted = muted
    }
  }, [volume, muted])

  useEffect(() => {
    // 2 - run this function
    const audio = audioRef.current
    const updatePosition = () => {
      if (audio && trackInfo.duration) {
        const currentPosition = (audio.currentTime / trackInfo.duration) * 100
        setPosition([currentPosition])
      }
    }
    audio?.addEventListener('timeupdate', updatePosition)

    // 3 cleanup after the component is unmounted, or if track info changes and we need to replay the function, i.e. add another event listenter
    return () => {
      audio?.removeEventListener('timeupdate', updatePosition)
    }
  }, 
  // 1 - when track info changes
  [trackInfo])

  useEffect(() => {
    async function playAudio() {
      await audioRef.current!.play()
      setPlaying(true)
    }
    if (trackInfo?.playbackUrl && audioRef.current) {
      audioRef.current!.src = trackInfo.playbackUrl
      audioRef.current!.load()

      audioRef.current!.currentTime = 0
      playAudio()
    }
  }, [trackInfo?.playbackUrl])

  const currentTime = ((position[0] ?? 0) / 100) * trackInfo.duration

  const handleSeek = (ranges: number[]) => {
    const seekTime = (ranges[0]! / 100) * trackInfo.duration
    audioRef.current!.currentTime = seekTime
    setPosition(ranges)
  }

  return (
    <div className='bg-background/40 bg-linear-to-r rounded-sm border-t flex flex-col w-full font-bold z-30 px-2 py-2 md:px-4 md:py-2'>

      {/* Row 1: image, title/artist, controls, volume */}
      <div className='flex items-center gap-2 w-full'>
        <div id="player-image" className='aspect-square shrink-0 border-r w-10 h-10 md:w-14 md:h-14 flex items-center justify-center'>
          {trackInfo.thumbnail
            ? <img src={trackInfo.thumbnail} className="rounded-md cursor-pointer w-full h-full object-cover" />
            : <Music className='text-white w-5 h-5' />
          }
        </div>

        <div id="player-title" className='min-w-0'>
          <h2 className="cursor-pointer text-sm md:text-base truncate">{trackInfo?.title}</h2>
          <p className="cursor-pointer italic text-muted-foreground capitalize text-xs truncate">{trackInfo?.createdBy}</p>
        </div>

        <div id="player-controls" className='flex mx-auto space-x-1 md:space-x-2 shrink-0'>
          <ArrowBigLeft className="cursor-pointer w-5 h-5 md:w-6 md:h-6" />
          {playing && audioRef.current?.src ? <Pause className='cursor-pointer w-5 h-5 md:w-6 md:h-6' onClick={() => { audioRef.current?.pause(); setPlaying(false) }} /> : <Play className='cursor-pointer w-5 h-5 md:w-6 md:h-6' onClick={() => { audioRef.current?.play(); setPlaying(true) }} />}
          <ArrowBigRight className="cursor-pointer w-5 h-5 md:w-6 md:h-6" />
        </div>

        <div id="volume" className="cursor-pointer hidden sm:flex items-center gap-2 shrink-0">
          {muted ? <VolumeOff className='w-4 h-4 md:w-5 md:h-5' onClick={() => setMuted(!muted)}/> : <Volume2 className='w-4 h-4 md:w-5 md:h-5' onClick={() => setMuted(!muted)}/>}
          
          <Slider className='w-16 md:w-24' defaultValue={[80]} max={100} min={0} step={1} value={volume} onValueChange={setVolume} />
        </div>
      </div>

      {/* Row 2: current time, scrubber, duration */}
      <div id="player-tracking" className='flex items-center gap-2 w-full mt-1 px-1'>
        <span className='text-xs text-muted-foreground tabular-nums w-10 text-right shrink-0'>
          {trackInfo && trackInfo.playbackUrl ? formatTime(currentTime) : '-'}
        </span>
        <Slider
          className='flex-1'
          defaultValue={[0]}
          max={100}
          min={0}
          step={1}
          value={position}
          onValueChange={(timeRanges) => handleSeek(timeRanges)}
        />
        <span className='text-xs text-muted-foreground tabular-nums w-10 shrink-0'>
          {trackInfo && trackInfo.playbackUrl ? `-${formatTime(trackInfo.duration - currentTime)}` : '-'}
        </span>
      </div>
        
        <audio ref={audioRef}/>
    </div>
  )
}

export default SoundBar