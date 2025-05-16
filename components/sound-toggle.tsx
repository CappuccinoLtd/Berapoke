"use client"

import { Volume2, VolumeX, Music } from "lucide-react"

interface SoundToggleProps {
  isSoundEnabled: boolean
  isMusicPlaying?: boolean
  toggleSound: () => void
}

export function SoundToggle({ isSoundEnabled, isMusicPlaying, toggleSound }: SoundToggleProps) {
  return (
    <div className="relative">
      <button
        onClick={toggleSound}
        className={`relative flex items-center justify-center w-10 h-10 rounded-full bg-[#131f01]/80 hover:bg-[#1a2a02]/80 transition-colors duration-200 text-white ${
          isSoundEnabled ? "sound-enabled" : ""
        }`}
        aria-label={isSoundEnabled ? "Mute sounds" : "Enable sounds"}
      >
        {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>

      {/* Music indicator */}
      {isMusicPlaying && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#fab540] rounded-full flex items-center justify-center">
          <Music size={10} className="text-white music-icon" />
        </div>
      )}

      {/* Silent mode indicator */}
      {isSoundEnabled && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs text-white bg-[#131f01]/80 px-2 py-0.5 rounded-full">
          Silent Mode
        </div>
      )}
    </div>
  )
}
