"use client"

import { useState, useCallback } from "react"

type SoundType = "jungle" | "multiplier" | "cashout" | "crash" | "music"

export function useSoundManager() {
  const [isSoundEnabled, setIsSoundEnabled] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)

  // Toggle sound on/off
  const toggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => {
      const newState = !prev

      // Toggle music state when sound is toggled
      setIsMusicPlaying(newState)

      return newState
    })
  }, [])

  // These are stub methods that simulate sound functionality
  // without actually loading or playing audio files
  const playSound = useCallback((_type: SoundType) => {
    // This is intentionally empty - just a stub
    // We're not actually playing sounds to avoid errors
    return
  }, [])

  const stopSound = useCallback((_type: SoundType) => {
    // This is intentionally empty - just a stub
    return
  }, [])

  // Stub methods for music control
  const playMusic = useCallback(() => {
    setIsMusicPlaying(true)
  }, [])

  const stopMusic = useCallback(() => {
    setIsMusicPlaying(false)
  }, [])

  return {
    isSoundEnabled,
    isMusicPlaying,
    toggleSound,
    playSound,
    stopSound,
    playMusic,
    stopMusic,
  }
}
