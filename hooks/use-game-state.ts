"use client"

import { useState, useEffect, useCallback } from "react"

type GameState = "waiting" | "playing" | "crashed"
type PanelType = "left" | "right"

// Define a type for bet history entries
export type BetHistoryEntry = {
  id: number
  amount: number
  outcome: "win" | "loss"
  multiplier: number
  profit: number
  timestamp: Date
  autoCashout: boolean
  panel: PanelType // Track which panel the bet came from
}

export function useGameState() {
  // Game state
  const [gameState, setGameState] = useState<GameState>("waiting")
  const [multiplier, setMultiplier] = useState(1.0)
  const [countdown, setCountdown] = useState(10.0)
  const [crashPoint, setCrashPoint] = useState(0)
  const [lastCrashPoint, setLastCrashPoint] = useState(0)
  const [crashHistory, setCrashHistory] = useState<number[]>([])
  const [roundCount, setRoundCount] = useState(0) // Track number of rounds played

  // Auto cashout settings
  const [isAutoCashoutEnabled, setIsAutoCashoutEnabled] = useState(false)
  const [autoCashoutMultiplier, setAutoCashoutMultiplier] = useState(2.0)

  // Player stats and history
  const [betHistory, setBetHistory] = useState<BetHistoryEntry[]>([])
  const [totalWins, setTotalWins] = useState(0)
  const [totalLosses, setTotalLosses] = useState(0)
  const [totalProfit, setTotalProfit] = useState(0)
  const [biggestWin, setBiggestWin] = useState(0)
  const [biggestLoss, setBiggestLoss] = useState(0)

  // Panel-specific bet tracking
  const [leftPanelBet, setLeftPanelBet] = useState(0)
  const [rightPanelBet, setRightPanelBet] = useState(0)
  const [leftPanelActive, setLeftPanelActive] = useState(false)
  const [rightPanelActive, setRightPanelActive] = useState(false)
  const [leftPanelAutoCashout, setLeftPanelAutoCashout] = useState(false)
  const [rightPanelAutoCashout, setRightPanelAutoCashout] = useState(false)

  // Generate a random crash point between 1.0 and 10.0
  const generateCrashPoint = useCallback(() => {
    // This is a simplified version - real crash games use more complex algorithms
    // to determine crash points with house edge
    const min = 1.1
    const max = 10.0
    return Number.parseFloat((Math.random() * (max - min) + min).toFixed(2))
  }, [])

  // Reset the game state for a new round
  const resetGame = useCallback(() => {
    // Store the last crash point in history
    if (crashPoint > 0) {
      setCrashHistory((prev) => {
        const newHistory = [crashPoint, ...prev]
        // Keep only the last 10 crash points
        return newHistory.slice(0, 10)
      })
      setLastCrashPoint(crashPoint)
    }

    // Reset game state for a new round
    setGameState("waiting")
    setMultiplier(1.0)
    setCountdown(10.0) // Reset to 10 seconds
    setCrashPoint(generateCrashPoint())
    setRoundCount((prev) => prev + 1) // Increment round counter

    // Reset panel auto cashout flags
    setLeftPanelAutoCashout(false)
    setRightPanelAutoCashout(false)

    console.log("Game reset - starting new round with 10 second countdown")
  }, [crashPoint, generateCrashPoint])

  // Place a bet for a specific panel
  const placeBet = useCallback((amount: number, panel: PanelType) => {
    if (amount <= 0) return false

    // Allow placing bets during both waiting and playing states
    console.log(`Bet placed on ${panel} panel: $${amount.toFixed(2)}`)

    if (panel === "left") {
      setLeftPanelBet(amount)
      setLeftPanelActive(true)
    } else {
      setRightPanelBet(amount)
      setRightPanelActive(true)
    }

    return true
  }, [])

  // Cancel a bet for a specific panel
  const cancelBet = useCallback(
    (panel: PanelType) => {
      if (gameState !== "waiting") return false

      if (panel === "left" && leftPanelActive) {
        console.log(`Bet canceled on left panel: $${leftPanelBet.toFixed(2)}`)
        setLeftPanelActive(false)
        setLeftPanelBet(0)
        return true
      } else if (panel === "right" && rightPanelActive) {
        console.log(`Bet canceled on right panel: $${rightPanelBet.toFixed(2)}`)
        setRightPanelActive(false)
        setRightPanelBet(0)
        return true
      }

      return false
    },
    [gameState, leftPanelActive, rightPanelActive, leftPanelBet, rightPanelBet],
  )

  // Cash out for a specific panel
  const cashOut = useCallback(
    (isAutoCashout: boolean, panel: PanelType) => {
      if (gameState !== "playing") return 0

      let betAmount = 0
      let isActive = false

      if (panel === "left") {
        betAmount = leftPanelBet
        isActive = leftPanelActive
        if (!isActive) return 0
      } else {
        betAmount = rightPanelBet
        isActive = rightPanelActive
        if (!isActive) return 0
      }

      const winnings = betAmount * multiplier
      const profit = winnings - betAmount
      console.log(`Cashed out at ${multiplier.toFixed(2)}x: $${winnings.toFixed(2)} from ${panel} panel`)

      // Record the win in history
      const newEntry: BetHistoryEntry = {
        id: Date.now(),
        amount: betAmount,
        outcome: "win",
        multiplier: multiplier,
        profit: profit,
        timestamp: new Date(),
        autoCashout: isAutoCashout,
        panel: panel,
      }

      setBetHistory((prev) => [newEntry, ...prev].slice(0, 20)) // Keep last 20 entries
      setTotalWins((prev) => prev + 1)
      setTotalProfit((prev) => prev + profit)

      // Update biggest win if applicable
      if (profit > biggestWin) {
        setBiggestWin(profit)
      }

      // Deactivate the panel
      if (panel === "left") {
        setLeftPanelActive(false)
      } else {
        setRightPanelActive(false)
      }

      return winnings
    },
    [gameState, multiplier, leftPanelBet, rightPanelBet, leftPanelActive, rightPanelActive, biggestWin],
  )

  // Record losses for active panels when the game crashes
  const recordLosses = useCallback(() => {
    // Check left panel
    if (leftPanelActive) {
      const newEntry: BetHistoryEntry = {
        id: Date.now(),
        amount: leftPanelBet,
        outcome: "loss",
        multiplier: crashPoint,
        profit: -leftPanelBet,
        timestamp: new Date(),
        autoCashout: false,
        panel: "left",
      }

      setBetHistory((prev) => [newEntry, ...prev].slice(0, 20))
      setTotalLosses((prev) => prev + 1)
      setTotalProfit((prev) => prev - leftPanelBet)

      // Update biggest loss if applicable
      if (leftPanelBet > biggestLoss) {
        setBiggestLoss(leftPanelBet)
      }

      // Reset panel active state but don't disable autoplay
      setLeftPanelActive(false)
    }

    // Check right panel
    if (rightPanelActive) {
      const newEntry: BetHistoryEntry = {
        id: Date.now() + 1, // Ensure unique ID
        amount: rightPanelBet,
        outcome: "loss",
        multiplier: crashPoint,
        profit: -rightPanelBet,
        timestamp: new Date(),
        autoCashout: false,
        panel: "right",
      }

      setBetHistory((prev) => [newEntry, ...prev].slice(0, 20))
      setTotalLosses((prev) => prev + 1)
      setTotalProfit((prev) => prev - rightPanelBet)

      // Update biggest loss if applicable
      if (rightPanelBet > biggestLoss) {
        setBiggestLoss(rightPanelBet)
      }

      // Reset panel active state but don't disable autoplay
      setRightPanelActive(false)
    }
  }, [leftPanelActive, rightPanelActive, leftPanelBet, rightPanelBet, crashPoint, biggestLoss])

  // Check for auto cashout for each panel
  useEffect(() => {
    if (gameState === "playing" && isAutoCashoutEnabled && multiplier >= autoCashoutMultiplier) {
      // Check left panel
      if (leftPanelActive && !leftPanelAutoCashout) {
        console.log(`Auto cashout triggered for left panel at ${multiplier.toFixed(2)}x`)
        setLeftPanelAutoCashout(true)
        cashOut(true, "left")
      }

      // Check right panel
      if (rightPanelActive && !rightPanelAutoCashout) {
        console.log(`Auto cashout triggered for right panel at ${multiplier.toFixed(2)}x`)
        setRightPanelAutoCashout(true)
        cashOut(true, "right")
      }
    }
  }, [
    gameState,
    multiplier,
    isAutoCashoutEnabled,
    autoCashoutMultiplier,
    leftPanelActive,
    rightPanelActive,
    leftPanelAutoCashout,
    rightPanelAutoCashout,
    cashOut,
  ])

  // Game loop - this is the core of the continuous round cycling
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (gameState === "waiting") {
      // Countdown before the game starts with milliseconds
      if (countdown > 0) {
        timer = setTimeout(() => {
          // Decrease by 0.01 seconds (10 milliseconds)
          setCountdown((prev) => Number.parseFloat((prev - 0.01).toFixed(2)))
        }, 10) // Update every 10ms for smooth countdown
      } else {
        // Start the game when countdown reaches 0
        console.log("Countdown complete - starting game")
        setGameState("playing")
        setMultiplier(1.0)
      }
    } else if (gameState === "playing") {
      // Increase the multiplier until it reaches the crash point
      if (multiplier < crashPoint) {
        timer = setTimeout(() => {
          // Increase the multiplier at a rate that makes it feel smooth
          // The higher the multiplier, the faster it increases
          const increment = 0.01 * (1 + multiplier / 10)
          setMultiplier((prev) => Number.parseFloat((prev + increment).toFixed(2)))
        }, 100)
      } else {
        // Game crashed
        console.log(`Game crashed at ${multiplier.toFixed(2)}x!`)
        setGameState("crashed")

        // Record losses for any active panels
        recordLosses()

        // Immediately start a new round
        console.log("Immediately starting new round after crash")
        resetGame()
      }
    }

    return () => clearTimeout(timer)
  }, [gameState, countdown, multiplier, crashPoint, resetGame, recordLosses])

  // Initialize the game
  useEffect(() => {
    console.log("Initializing game")
    setCrashPoint(generateCrashPoint())
  }, [generateCrashPoint])

  // Calculate potential winnings for each panel
  const getLeftPanelWinnings = useCallback(() => {
    return leftPanelActive ? leftPanelBet * multiplier : 0
  }, [leftPanelActive, leftPanelBet, multiplier])

  const getRightPanelWinnings = useCallback(() => {
    return rightPanelActive ? rightPanelBet * multiplier : 0
  }, [rightPanelActive, rightPanelBet, multiplier])

  return {
    gameState,
    multiplier,
    countdown,
    placeBet,
    cashOut,
    cancelBet,
    lastCrashPoint,
    crashHistory,
    roundCount,
    // Panel-specific state
    leftPanelBet,
    rightPanelBet,
    leftPanelActive,
    rightPanelActive,
    getLeftPanelWinnings,
    getRightPanelWinnings,
    // Auto cashout properties
    isAutoCashoutEnabled,
    setIsAutoCashoutEnabled,
    autoCashoutMultiplier,
    setAutoCashoutMultiplier,
    // Stats and history properties
    betHistory,
    totalWins,
    totalLosses,
    totalProfit,
    biggestWin,
    biggestLoss,
  }
}
