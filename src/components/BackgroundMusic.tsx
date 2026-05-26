import { useEffect, useRef, useState } from 'react'

// YouTube Player interface for background music
interface BackgroundYTPlayer {
  playVideo: () => void
  pauseVideo: () => void
  setVolume: (volume: number) => void
  getVolume: () => number
  mute: () => void
  unMute: () => void
  isMuted: () => boolean
  getPlayerState: () => number
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
}

interface BackgroundMusicProps {
  videoId: string // YouTube video ID
  volume?: number // Volume 0-100, default 30
  credit?: string // Sound credit, e.g., "F1 - Hans Zimmer"
}

export default function BackgroundMusic({ videoId, volume = 15, credit = "F1 - Hans Zimmer" }: BackgroundMusicProps) {
  const playerRef = useRef<BackgroundYTPlayer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hasStartedRef = useRef(false)
  const [isPlaying, setIsPlaying] = useState(false) // Start as paused until user interaction
  const [currentVolume, setCurrentVolume] = useState(volume)
  const isAdjustingVolumeRef = useRef(false)
  const playStateCheckIntervalRef = useRef<number | null>(null)

  useEffect(() => {
    // Load YouTube iframe API if not already loaded
    const loadYouTubeAPI = () => {
      const yt = (window as any).YT
      if (yt && yt.Player) {
        initializePlayer()
        return
      }

      // Set up callback for when API is ready
      ;(window as any).onYouTubeIframeAPIReady = () => {
        initializePlayer()
      }

      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }

    const initializePlayer = () => {
      if (!containerRef.current) {
        console.log('Container not ready')
        return
      }

      try {
        const yt = (window as any).YT
        if (!yt || !yt.Player) {
          console.log('YouTube API not loaded yet')
          return
        }

        new yt.Player(containerRef.current, {
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            loop: 1,
            playlist: videoId, // Required for loop to work
            start: 30, // Start from 10 seconds
            controls: 0,
            showinfo: 0,
            modestbranding: 1,
            rel: 0,
            iv_load_policy: 3,
            cc_load_policy: 0,
            fs: 0,
            disablekb: 1,
            enablejsapi: 1,
            mute: 0, // Start unmuted
          },
          events: {
            onReady: (event: { target: BackgroundYTPlayer }) => {
              console.log('Background music player ready')
              playerRef.current = event.target
              event.target.setVolume(currentVolume)
              // No autoplay — playback starts only when the user clicks the play button.
            },
            onStateChange: (event: { data: number; target: BackgroundYTPlayer }) => {
              // YT.PlayerState.ENDED = 0
              // YT.PlayerState.PLAYING = 1
              // YT.PlayerState.PAUSED = 2
              // YT.PlayerState.BUFFERING = 3
              // YT.PlayerState.CUED = 5
              if (event.data === 1) {
                console.log('Background music is playing')
                hasStartedRef.current = true
                setIsPlaying(true)
              } else if (event.data === 2) {
                setIsPlaying(false)
              } else if (event.data === 0) {
                // Video ended, restart from 10 seconds
                event.target.seekTo(10, true)
                event.target.playVideo()
              }
            },
          },
        })
      } catch (error) {
        console.log('Background music initialization error:', error)
      }
    }

    loadYouTubeAPI()

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.pauseVideo()
        } catch (error) {
          console.log('Error pausing background music:', error)
        }
      }
      if (playStateCheckIntervalRef.current) {
        window.clearInterval(playStateCheckIntervalRef.current)
      }
    }
  }, [videoId, currentVolume])

  const handleTogglePlay = () => {
    if (!playerRef.current) return

    try {
      if (isPlaying) {
        playerRef.current.pauseVideo()
        setIsPlaying(false)
      } else {
        playerRef.current.playVideo()
        setIsPlaying(true)
      }
    } catch (error) {
      console.log('Error toggling music:', error)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value)
    setCurrentVolume(newVolume)
    if (playerRef.current) {
      try {
        // Save current playing state
        const shouldBePlaying = isPlaying
        playerRef.current.setVolume(newVolume)
        
        // Immediately check and resume if needed
        if (shouldBePlaying) {
          setTimeout(() => {
            if (playerRef.current) {
              const state = playerRef.current.getPlayerState()
              if (state === 2 || state === 0) {
                try {
                  playerRef.current.playVideo()
                } catch (error) {
                  console.log('Error resuming after volume change:', error)
                }
              }
            }
          }, 50)
        }
      } catch (error) {
        console.log('Error setting volume:', error)
      }
    }
  }

  const handleVolumeMouseDown = () => {
    // Mark that we're adjusting volume
    isAdjustingVolumeRef.current = true
    
    // Start checking play state more frequently
    if (playStateCheckIntervalRef.current) {
      window.clearInterval(playStateCheckIntervalRef.current)
    }
    
    playStateCheckIntervalRef.current = window.setInterval(() => {
      if (playerRef.current && isAdjustingVolumeRef.current) {
        const state = playerRef.current.getPlayerState()
        // If it should be playing but is paused or ended, resume
        if (isPlaying && (state === 2 || state === 0)) {
          try {
            playerRef.current.playVideo()
          } catch (error) {
            // Silently handle errors
          }
        }
      }
    }, 50) // Check every 50ms for more responsive recovery
  }

  const handleVolumeMouseUp = () => {
    // Stop checking when done adjusting
    isAdjustingVolumeRef.current = false
    if (playStateCheckIntervalRef.current) {
      window.clearInterval(playStateCheckIntervalRef.current)
      playStateCheckIntervalRef.current = null
    }
    
    // Final check to ensure it's playing if it should be
    if (playerRef.current && isPlaying) {
      const state = playerRef.current.getPlayerState()
      if (state === 2 || state === 0) {
        try {
          playerRef.current.playVideo()
        } catch (error) {
          console.log('Error resuming playback:', error)
        }
      }
    }
  }

  return (
    <>
      <div
        ref={containerRef}
        className="background-music-player"
        style={{
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none',
          visibility: 'hidden',
        }}
      />
      <div className="background-music-control-container">
        <button
          className="background-music-control"
          onClick={handleTogglePlay}
          aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
        >
          {isPlaying ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>
        <div className="background-music-volume-control">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="volume-icon">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <input
            type="range"
            min="0"
            max="100"
            value={currentVolume}
            onChange={handleVolumeChange}
            onInput={handleVolumeChange}
            onMouseDown={handleVolumeMouseDown}
            onMouseUp={handleVolumeMouseUp}
            onMouseLeave={handleVolumeMouseUp}
            onTouchStart={handleVolumeMouseDown}
            onTouchEnd={handleVolumeMouseUp}
            className="volume-slider"
            aria-label="Volume control"
          />
        </div>
        <div className="background-music-credit">
          {credit}
        </div>
      </div>
    </>
  )
}

