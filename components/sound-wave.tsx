"use client"

interface SoundWaveProps {
  isPlaying: boolean
}

export function SoundWave({ isPlaying }: SoundWaveProps) {
  if (!isPlaying) return null

  return (
    <div className="sound-wave flex items-center justify-center h-6 gap-[2px]">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="sound-bar w-1 bg-[#fab540] rounded-full opacity-80"
          style={{
            height: `${Math.max(8, Math.random() * 24)}px`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  )
}
