"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"

interface AutoCashoutControlProps {
  isEnabled: boolean
  onToggle: (enabled: boolean) => void
  multiplier: number
  onMultiplierChange: (value: number) => void
  currentMultiplier: number
  gameState: "waiting" | "playing" | "crashed"
}

export function AutoCashoutControl({
  isEnabled,
  onToggle,
  multiplier,
  onMultiplierChange,
  currentMultiplier,
  gameState,
}: AutoCashoutControlProps) {
  const [inputValue, setInputValue] = useState(multiplier.toFixed(2))

  // Update the input value when the multiplier prop changes
  useEffect(() => {
    setInputValue(multiplier.toFixed(2))
  }, [multiplier])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    // Only update the actual multiplier if the value is a valid number
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue) && numValue >= 1.01) {
      onMultiplierChange(numValue)
    }
  }

  // Handle input blur to ensure valid values
  const handleInputBlur = () => {
    const numValue = Number.parseFloat(inputValue)
    if (isNaN(numValue) || numValue < 1.01) {
      setInputValue("1.01")
      onMultiplierChange(1.01)
    }
  }

  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    const newValue = value[0]
    setInputValue(newValue.toFixed(2))
    onMultiplierChange(newValue)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-white">Auto Cashout</span>
        <Switch checked={isEnabled} onCheckedChange={onToggle} disabled={gameState === "playing"} />
      </div>

      <div className="flex items-center gap-2">
        <Slider
          value={[Number.parseFloat(inputValue)]}
          min={1.01}
          max={10}
          step={0.01}
          onValueChange={handleSliderChange}
          disabled={!isEnabled || gameState === "playing"}
          className={`${isEnabled ? "" : "opacity-50"}`}
        />
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            disabled={!isEnabled || gameState === "playing"}
            className={`w-20 bet-input text-center ${isEnabled ? "" : "opacity-50 cursor-not-allowed"}`}
            aria-label="Auto cashout multiplier"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white">×</span>
        </div>
      </div>

      {isEnabled && (
        <div className="text-xs text-[#fab540]">
          {gameState === "playing" && currentMultiplier < multiplier ? (
            <div className="animate-pulse">
              Will auto cashout at {multiplier.toFixed(2)}× ({((multiplier - currentMultiplier) * 100).toFixed(0)}% to
              go)
            </div>
          ) : gameState === "waiting" ? (
            <div>Will auto cashout when multiplier reaches {multiplier.toFixed(2)}×</div>
          ) : null}
        </div>
      )}
    </div>
  )
}
