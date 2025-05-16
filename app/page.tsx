"use client"
import Image from "next/image"
import { useGameState } from "@/hooks/use-game-state"
import { BeeChart } from "@/components/bee-chart"
import { BetHistory } from "@/components/bet-history"
import { AutoCashoutControl } from "@/components/auto-cashout-control"
import { useState, useEffect, useCallback } from "react"
import { useSoundManager } from "@/hooks/use-sound-manager"
import { SoundToggle } from "@/components/sound-toggle"
import { SoundWave } from "@/components/sound-wave"

export default function BeraPoke() {
  const {
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
  } = useGameState()

  // Separate bet amounts for left and right panels
  const [leftBetAmount, setLeftBetAmount] = useState(0)
  const [rightBetAmount, setRightBetAmount] = useState(0)

  // Separate auto mode states for left and right panels
  const [isLeftPanelAutoMode, setIsLeftPanelAutoMode] = useState(false)
  const [isRightPanelAutoMode, setIsRightPanelAutoMode] = useState(false)

  // State to track game state changes for animations
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Replace the single button press state with two separate states
  const [isLeftButtonPressed, setIsLeftButtonPressed] = useState(false)
  const [isRightButtonPressed, setIsRightButtonPressed] = useState(false)

  // State to track if buttons are in cash out state
  const [isLeftButtonCashOut, setIsLeftButtonCashOut] = useState(false)
  const [isRightButtonCashOut, setIsRightButtonCashOut] = useState(false)

  // Track potential winnings for each panel
  const [leftPotentialWinnings, setLeftPotentialWinnings] = useState(0)
  const [rightPotentialWinnings, setRightPotentialWinnings] = useState(0)

  // Add these new state variables after the other state declarations (around line 50)
  // State to track if a bet is pending confirmation (in "Cancel" state)
  const [leftPanelPendingBet, setLeftPanelPendingBet] = useState(false)
  const [rightPanelPendingBet, setRightPanelPendingBet] = useState(false)

  // Add this inside the BeraPoke component, after the other state variables
  const { isSoundEnabled, isMusicPlaying, toggleSound, playSound, stopSound } = useSoundManager()

  // Add state for silent mode notification
  const [showSilentModeNotification, setShowSilentModeNotification] = useState(false)

  // Add state for autoplay
  const [isLeftPanelAutoplayEnabled, setIsLeftPanelAutoplayEnabled] = useState(false)
  const [isRightPanelAutoplayEnabled, setIsRightPanelAutoplayEnabled] = useState(false)

  // Add state for autoplay notifications
  const [showAutoplayNotification, setShowAutoplayNotification] = useState(false)
  const [autoplayMessage, setAutoplayMessage] = useState("")

  // Add state to prevent multiple auto cashouts
  const [leftPanelAutoCashout, setLeftPanelAutoCashout] = useState(false)
  const [rightPanelAutoCashout, setRightPanelAutoCashout] = useState(false)

  // Update the autoplay effect to automatically "press" the play button when enabled
  // Replace the existing autoplay effect (around line 80) with this updated version:

  // Effect to handle autoplay bets at the start of each round
  useEffect(() => {
    if (gameState === "waiting" && countdown >= 9.9 && countdown <= 10.0) {
      // Small delay to ensure we're at the start of a new round
      const autoplayTimer = setTimeout(() => {
        // Place bet for left panel if autoplay is enabled
        if (isLeftPanelAutoplayEnabled && leftBetAmount > 0) {
          // Automatically "press" the play button by setting the pending bet
          setLeftPanelPendingBet(true)

          // Then immediately confirm the bet (as if the game started)
          placeBet(leftBetAmount, "left")
          setLeftPanelPendingBet(false)

          setAutoplayMessage(`Autoplay: Placed $${leftBetAmount.toFixed(2)} bet on left panel`)
          setShowAutoplayNotification(true)
          console.log("Autoplay: Placed bet for left panel")
        }

        // Place bet for right panel if autoplay is enabled
        if (isRightPanelAutoplayEnabled && rightBetAmount > 0) {
          // Automatically "press" the play button by setting the pending bet
          setRightPanelPendingBet(true)

          // Then immediately confirm the bet (as if the game started)
          placeBet(rightBetAmount, "right")
          setRightPanelPendingBet(false)

          setAutoplayMessage(`Autoplay: Placed $${rightBetAmount.toFixed(2)} bet on right panel`)
          setShowAutoplayNotification(true)
          console.log("Autoplay: Placed bet for right panel")
        }
      }, 300)

      return () => clearTimeout(autoplayTimer)
    }
  }, [
    gameState,
    countdown,
    isLeftPanelAutoplayEnabled,
    isRightPanelAutoplayEnabled,
    leftPanelActive,
    rightPanelActive,
    leftBetAmount,
    rightBetAmount,
    placeBet,
    cancelBet,
  ])

  // Add this after the existing autoplay effect
  useEffect(() => {
    if (showAutoplayNotification) {
      const timer = setTimeout(() => {
        setShowAutoplayNotification(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showAutoplayNotification])

  // Check for auto cashout for each panel
  useEffect(() => {
    if (gameState === "playing" && isAutoCashoutEnabled) {
      // Check left panel
      if (leftPanelActive && !leftPanelAutoCashout && multiplier >= autoCashoutMultiplier) {
        console.log(
          `Auto cashout triggered for left panel at ${multiplier.toFixed(2)}x (target: ${autoCashoutMultiplier.toFixed(2)}x)`,
        )
        setLeftPanelAutoCashout(true)
        cashOut(true, "left")
        playSound("cashout")

        // Show notification
        setAutoplayMessage(`Auto cashout: Left panel at ${multiplier.toFixed(2)}×`)
        setShowAutoplayNotification(true)
      }

      // Check right panel
      if (rightPanelActive && !rightPanelAutoCashout && multiplier >= autoCashoutMultiplier) {
        console.log(
          `Auto cashout triggered for right panel at ${multiplier.toFixed(2)}x (target: ${autoCashoutMultiplier.toFixed(2)}x)`,
        )
        setRightPanelAutoCashout(true)
        cashOut(true, "right")
        playSound("cashout")

        // Show notification
        setAutoplayMessage(`Auto cashout: Right panel at ${multiplier.toFixed(2)}×`)
        setShowAutoplayNotification(true)
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
    playSound,
  ])

  // Handle game state transitions for animations
  useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [gameState])

  // Update cash out state when game state changes
  useEffect(() => {
    if (gameState === "playing") {
      if (leftPanelActive) {
        setIsLeftButtonCashOut(true)
      }
      if (rightPanelActive) {
        setIsRightButtonCashOut(true)
      }
    } else if (gameState === "waiting") {
      setIsLeftButtonCashOut(false)
      setIsRightButtonCashOut(false)
      setLeftPanelAutoCashout(false)
      setRightPanelAutoCashout(false)
    }
  }, [gameState, leftPanelActive, rightPanelActive])

  // Update potential winnings for each panel when multiplier changes
  useEffect(() => {
    setLeftPotentialWinnings(getLeftPanelWinnings())
    setRightPotentialWinnings(getRightPanelWinnings())
  }, [multiplier, getLeftPanelWinnings, getRightPanelWinnings])

  // Show silent mode notification when sound is first enabled
  useEffect(() => {
    if (isSoundEnabled) {
      setShowSilentModeNotification(true)
      const timer = setTimeout(() => {
        setShowSilentModeNotification(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isSoundEnabled])

  // Handle quick bet amount selection for left panel
  const handleLeftQuickBet = (amount: number) => {
    setLeftBetAmount(amount)
  }

  // Handle quick bet amount selection for right panel
  const handleRightQuickBet = (amount: number) => {
    setRightBetAmount(amount)
  }

  // Add this effect to handle multiplier sound based on game state
  useEffect(() => {
    if (gameState === "playing") {
      playSound("multiplier")
    } else {
      stopSound("multiplier")
    }
  }, [gameState, playSound, stopSound])

  // Add this effect to play sounds for specific events
  useEffect(() => {
    if (gameState === "crashed") {
      playSound("crash")
    }
  }, [gameState, playSound])

  // Replace the handleLeftPlayButton function with this updated version
  const handleLeftPlayButton = useCallback(() => {
    // After a short delay, perform the action
    setTimeout(() => {
      if (gameState === "waiting" && !leftPanelActive && !leftPanelPendingBet) {
        // Initial click - show Cancel button (red)
        if (leftBetAmount > 0) {
          setLeftPanelPendingBet(true)
        }
      } else if (gameState === "waiting" && leftPanelPendingBet) {
        // Cancel the pending bet
        setLeftPanelPendingBet(false)
      } else if (gameState === "waiting" && leftPanelActive) {
        // Cancel confirmed bet during waiting state
        cancelBet("left")

        // If this was an autoplay bet, disable autoplay
        if (isLeftPanelAutoplayEnabled) {
          setIsLeftPanelAutoplayEnabled(false)
          setAutoplayMessage("Autoplay disabled for left panel")
          setShowAutoplayNotification(true)
        }
      } else if (gameState === "playing" && leftPanelActive) {
        // Cash out during playing state
        cashOut(false, "left")
        playSound("cashout")
        setIsLeftButtonCashOut(false)

        // Note: We don't disable autoplay on cashout, so it will continue in the next round
      }
    }, 150)
  }, [
    gameState,
    leftPanelActive,
    leftPanelPendingBet,
    leftBetAmount,
    cancelBet,
    cashOut,
    playSound,
    isLeftPanelAutoplayEnabled,
  ])

  // Replace the handleRightPlayButton function with this updated version
  const handleRightPlayButton = useCallback(() => {
    // After a short delay, perform the action
    setTimeout(() => {
      if (gameState === "waiting" && !rightPanelActive && !rightPanelPendingBet) {
        // Initial click - show Cancel button (red)
        if (rightBetAmount > 0) {
          setRightPanelPendingBet(true)
        }
      } else if (gameState === "waiting" && rightPanelPendingBet) {
        // Cancel the pending bet
        setRightPanelPendingBet(false)
      } else if (gameState === "waiting" && rightPanelActive) {
        // Cancel confirmed bet during waiting state
        cancelBet("right")

        // If this was an autoplay bet, disable autoplay
        if (isRightPanelAutoplayEnabled) {
          setIsRightPanelAutoplayEnabled(false)
          setAutoplayMessage("Autoplay disabled for right panel")
          setShowAutoplayNotification(true)
        }
      } else if (gameState === "playing" && rightPanelActive) {
        // Cash out during playing state
        cashOut(false, "right")
        playSound("cashout")
        setIsRightButtonCashOut(false)

        // Note: We don't disable autoplay on cashout, so it will continue in the next round
      }
    }, 150)
  }, [
    gameState,
    rightPanelActive,
    rightPanelPendingBet,
    rightBetAmount,
    cancelBet,
    cashOut,
    playSound,
    isRightPanelAutoplayEnabled,
  ])

  // Add this effect to handle the transition from pending bet to active bet when the game starts
  // Add this after the other useEffect hooks
  useEffect(() => {
    // When game state changes to "playing", convert any pending bets to active bets
    if (gameState === "playing") {
      if (leftPanelPendingBet) {
        placeBet(leftBetAmount, "left")
        setLeftPanelPendingBet(false)
        setIsLeftButtonCashOut(true)
      }

      if (rightPanelPendingBet) {
        placeBet(rightBetAmount, "right")
        setRightPanelPendingBet(false)
        setIsRightButtonCashOut(true)
      }
    }
  }, [gameState, leftPanelPendingBet, rightPanelPendingBet, leftBetAmount, rightBetAmount, placeBet])

  // Replace the renderLeftPlayButton function with this updated version
  const renderLeftPlayButton = () => {
    // Determine button classes based on state
    let buttonBaseClasses = "play-button group"

    // Add state-specific classes
    if (leftPanelPendingBet) {
      // Pending bet - show cancel button (red)
      buttonBaseClasses += " cancel-button" // Special class for cancel button
    } else if (gameState === "waiting" && leftPanelActive) {
      // Cancel state - red button (entire button is red)
      buttonBaseClasses += " cancel-button" // Special class for cancel button
    } else if (isLeftButtonCashOut) {
      // Cash out state - orange button with pulse
      buttonBaseClasses += " cashout-button" // Special class for cash out button
    } else {
      // Default play state - green button
      buttonBaseClasses += " bg-[#38c12c] hover:bg-[#42d435] active:bg-[#32a827]"
      buttonBaseClasses += " box-shadow-green" // Custom shadow class for green button
    }

    // Add pressed state class if button is pressed
    if (isLeftButtonPressed) {
      buttonBaseClasses += " transform translate-y-1 shadow-pressed"
    }

    // Add other conditional classes
    if (leftBetAmount <= 0 && !leftPanelActive && !leftPanelPendingBet) {
      buttonBaseClasses += " opacity-50 cursor-not-allowed"
    }

    if (isLeftPanelAutoMode) {
      buttonBaseClasses += " mb-3"
    }

    // Changed the disabled logic to only disable when bet amount is 0 and no bet is placed
    const isDisabled = leftBetAmount <= 0 && !leftPanelActive && !leftPanelPendingBet

    return (
      <button
        onClick={handleLeftPlayButton}
        disabled={isDisabled}
        className={buttonBaseClasses}
        onMouseDown={() => setIsLeftButtonPressed(true)}
        onMouseUp={() => setIsLeftButtonPressed(false)}
        onMouseLeave={() => setIsLeftButtonPressed(false)}
      >
        <div className="play-button-content">
          {leftPanelPendingBet ? (
            // Show "Cancel" when bet is pending confirmation
            <>
              <span className="play-text text-white">Cancel</span>
              <span className="amount-text text-white">${leftBetAmount.toFixed(2)}</span>
            </>
          ) : gameState === "waiting" && leftPanelActive ? (
            // Show "Cancel" in white when a bet is placed and waiting for next round
            <>
              <span className="play-text text-white">Cancel</span>
              <span className="amount-text text-white">${leftPanelBet.toFixed(2)}</span>
            </>
          ) : isLeftButtonCashOut ? (
            // Show "Cash Out" when in cash out state
            <>
              <span className="play-text text-white">Cash Out</span>
              <span className="amount-text text-white">${leftPotentialWinnings.toFixed(2)}</span>
            </>
          ) : (
            // Default "Play" state
            <>
              <span className="play-text">Play</span>
              <span className="amount-text">${leftBetAmount.toFixed(2)}</span>
              {gameState === "waiting" && <span className="next-round-text">(next round)</span>}
            </>
          )}
        </div>
      </button>
    )
  }

  // Replace the renderRightPlayButton function with this updated version
  const renderRightPlayButton = () => {
    // Determine button classes based on state
    let buttonBaseClasses = "play-button group"

    // Add state-specific classes
    if (rightPanelPendingBet) {
      // Pending bet - show cancel button (red)
      buttonBaseClasses += " cancel-button" // Special class for cancel button
    } else if (gameState === "waiting" && rightPanelActive) {
      // Cancel state - red button (entire button is red)
      buttonBaseClasses += " cancel-button" // Special class for cancel button
    } else if (isRightButtonCashOut) {
      // Cash out state - orange button with pulse
      buttonBaseClasses += " cashout-button" // Special class for cash out button
    } else {
      // Default play state - green button
      buttonBaseClasses += " bg-[#38c12c] hover:bg-[#42d435] active:bg-[#32a827]"
      buttonBaseClasses += " box-shadow-green" // Custom shadow class for green button
    }

    // Add pressed state class if button is pressed
    if (isRightButtonPressed) {
      buttonBaseClasses += " transform translate-y-1 shadow-pressed"
    }

    // Add other conditional classes
    if (rightBetAmount <= 0 && !rightPanelActive && !rightPanelPendingBet) {
      buttonBaseClasses += " opacity-50 cursor-not-allowed"
    }

    if (isRightPanelAutoMode) {
      buttonBaseClasses += " mb-3"
    }

    // Changed the disabled logic to only disable when bet amount is 0 and no bet is placed
    const isDisabled = rightBetAmount <= 0 && !rightPanelActive && !rightPanelPendingBet

    return (
      <button
        onClick={handleRightPlayButton}
        disabled={isDisabled}
        className={buttonBaseClasses}
        onMouseDown={() => setIsRightButtonPressed(true)}
        onMouseUp={() => setIsRightButtonPressed(false)}
        onMouseLeave={() => setIsRightButtonPressed(false)}
      >
        <div className="play-button-content">
          {rightPanelPendingBet ? (
            // Show "Cancel" when bet is pending confirmation
            <>
              <span className="play-text text-white">Cancel</span>
              <span className="amount-text text-white">${rightBetAmount.toFixed(2)}</span>
            </>
          ) : gameState === "waiting" && rightPanelActive ? (
            // Show "Cancel" in white when a bet is placed and waiting for next round
            <>
              <span className="play-text text-white">Cancel</span>
              <span className="amount-text text-white">${rightPanelBet.toFixed(2)}</span>
            </>
          ) : isRightButtonCashOut ? (
            // Show "Cash Out" when in cash out state
            <>
              <span className="play-text text-white">Cash Out</span>
              <span className="amount-text text-white">${rightPotentialWinnings.toFixed(2)}</span>
            </>
          ) : (
            // Default "Play" state
            <>
              <span className="play-text">Play</span>
              <span className="amount-text">${rightBetAmount.toFixed(2)}</span>
              {gameState === "waiting" && <span className="next-round-text">(next round)</span>}
            </>
          )}
        </div>
      </button>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background leaf pattern overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/jungle-background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Main content container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-4">
        {/* Header with logo and buttons */}
        <header className="flex justify-between items-center mb-4">
          <div className="w-48">
            {/* Replaced logo with the provided image */}
            <Image src="/berapoke-logo.png" alt="Berapoke Logo" width={180} height={60} className="w-auto h-auto" />
          </div>
          <div className="flex gap-3 items-center">
            {/* Sound toggle button - now with music indicator */}
            <SoundToggle isSoundEnabled={isSoundEnabled} isMusicPlaying={isMusicPlaying} toggleSound={toggleSound} />
            {/* Simplified deposit button with just a glow effect on hover */}
            <button className="deposit-button bg-gradient-to-r from-[#fab540] to-[#6aa528] text-white font-bold py-2 px-6 rounded-full">
              Deposit
            </button>
            <button className="bg-white text-[#262626] font-bold py-2 px-6 rounded-full">Log In</button>
          </div>
        </header>

        {/* Silent mode notification */}
        {showSilentModeNotification && (
          <div className="fixed top-4 right-4 bg-[#131f01]/90 text-white p-3 rounded-lg shadow-lg z-50 max-w-xs animate-fade-in">
            <div className="font-bold mb-1">Silent Mode Activated</div>
            <div className="text-sm">Sound effects are simulated visually to avoid browser audio restrictions.</div>
          </div>
        )}

        {/* Autoplay notification */}
        {showAutoplayNotification && (
          <div className="fixed top-20 right-4 bg-[#fab540]/90 text-white p-3 rounded-lg shadow-lg z-50 max-w-xs animate-fade-in">
            <div className="font-bold mb-1">Autoplay Active</div>
            <div className="text-sm">{autoplayMessage}</div>
          </div>
        )}

        {/* Game container */}
        <div className="relative">
          {/* Main game area with the provided background image and animated leaves */}
          <div className="relative rounded-3xl overflow-hidden mb-4">
            {/* Game card background */}
            <div className="relative">
              <Image
                src="/game-card-bg.png"
                alt="Game Background"
                width={1200}
                height={400}
                className="w-full h-auto"
              />

              {/* Animated leaves */}
              <div className="absolute top-[10%] left-[5%] leaf-animation-1">
                <div className="w-16 h-16 bg-[#1a5c1a] rounded-tl-full rounded-br-full transform rotate-45"></div>
              </div>

              <div className="absolute top-[15%] right-[10%] leaf-animation-2">
                <div className="w-20 h-20 bg-[#1a5c1a] rounded-tl-full rounded-br-full transform -rotate-15"></div>
              </div>

              <div className="absolute bottom-[15%] left-[8%] leaf-animation-3">
                <div className="w-14 h-14 bg-[#1a5c1a] rounded-tr-full rounded-bl-full transform rotate-30"></div>
              </div>

              <div className="absolute bottom-[10%] right-[5%] leaf-animation-4">
                <div className="w-24 h-16 bg-[#1a5c1a] rounded-tl-[80%] rounded-br-[80%] transform -rotate-10"></div>
              </div>
            </div>

            {/* Game content positioned absolutely over the background */}
            <div className="absolute inset-0">
              {/* Multiplier row - show crash history */}
              <div className="flex overflow-x-auto py-2 px-4 gap-4">
                {crashHistory.map((point, index) => (
                  <div key={index} className="text-[#fab540] font-bold px-2">
                    {point.toFixed(2)}x
                  </div>
                ))}
              </div>

              {/* Main game display */}
              <div className="relative h-[400px] flex items-center justify-center overflow-hidden">
                {/* Glowing background effect */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <div className="glow-effect absolute -inset-10 bg-[#65842C]/30 blur-[50px] animate-glow-pulse"></div>
                </div>

                {/* Game state indicator */}
                <div
                  className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white font-bold ${
                    gameState === "waiting" ? "bg-yellow-500" : gameState === "playing" ? "bg-green-500" : "bg-red-500"
                  } transition-colors duration-300`}
                >
                  {gameState === "waiting" ? "NEXT ROUND" : gameState === "playing" ? "IN PROGRESS" : "CRASHED"}
                </div>

                {/* Round counter */}
                <div className="absolute top-4 right-4 px-3 py-1 bg-[#131f01]/80 text-white rounded-md text-sm">
                  Round #{roundCount}
                </div>

                {/* Multiplier display or Countdown */}
                <div
                  className={`absolute left-[15%] top-1/2 -translate-y-1/2 text-8xl font-extrabold transition-all duration-300 ${
                    gameState === "crashed" ? "text-red-500 scale-110" : "text-white"
                  } ${isTransitioning ? "opacity-0 scale-90" : "opacity-100 scale-100"}`}
                >
                  {gameState === "waiting" ? (
                    <div className="flex flex-col items-center">
                      <div className="text-8xl">{countdown.toFixed(2)}</div>
                      <div className="text-2xl mt-2">Next Round</div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div>{multiplier.toFixed(2)}×</div>
                      <SoundWave isPlaying={gameState === "playing" && isSoundEnabled} />
                    </div>
                  )}
                </div>

                {/* Bet status indicator - show both bets if placed */}
                {(leftPanelActive || rightPanelActive) && (
                  <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-[#fab540] text-white px-4 py-1 rounded-full font-bold">
                    BET PLACED: $
                    {((leftPanelActive ? leftPanelBet : 0) + (rightPanelActive ? rightPanelBet : 0)).toFixed(2)}
                  </div>
                )}

                {/* Active bets indicator */}
                {gameState === "playing" && (leftPanelActive || rightPanelActive) && (
                  <div className="absolute top-28 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-1 rounded-full font-bold flex items-center gap-2">
                    <span>ACTIVE BETS:</span>
                    {leftPanelActive && <span className="bg-blue-500 px-2 py-0.5 rounded-full text-xs">LEFT</span>}
                    {rightPanelActive && <span className="bg-purple-500 px-2 py-0.5 rounded-full text-xs">RIGHT</span>}
                  </div>
                )}

                {/* Auto cashout indicator */}
                {(leftPanelActive || rightPanelActive) && isAutoCashoutEnabled && gameState === "playing" && (
                  <div className="absolute top-40 left-1/2 -translate-x-1/2 bg-yellow-600 text-white px-4 py-1 rounded-full font-bold flex items-center">
                    <span>AUTO CASHOUT AT: {autoCashoutMultiplier.toFixed(2)}×</span>
                  </div>
                )}

                {/* Autoplay indicator */}
                {(isLeftPanelAutoplayEnabled || isRightPanelAutoplayEnabled) && (
                  <div className="absolute top-52 left-1/2 -translate-x-1/2 bg-[#fab540] text-white px-4 py-1 rounded-full font-bold flex items-center gap-2">
                    <span>AUTOPLAY:</span>
                    {isLeftPanelAutoplayEnabled && (
                      <span className="bg-blue-500 px-2 py-0.5 rounded-full text-xs">LEFT</span>
                    )}
                    {isRightPanelAutoplayEnabled && (
                      <span className="bg-purple-500 px-2 py-0.5 rounded-full text-xs">RIGHT</span>
                    )}
                  </div>
                )}

                {/* Center area - empty for future bear/beehive */}
                <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2">
                  {/* Empty center area */}
                </div>

                {/* Bee Chart area */}
                <div
                  className={`absolute right-[10%] top-1/2 -translate-y-1/2 w-[300px] h-[250px] transition-colors duration-300 ${
                    gameState === "crashed" ? "opacity-50" : "opacity-100"
                  }`}
                >
                  <BeeChart gameState={gameState} multiplier={multiplier} maxMultiplier={10} countdown={countdown} />
                </div>
              </div>
            </div>
          </div>

          {/* Game panels layout - now with 3 columns */}
          <div className="grid grid-cols-3 gap-4">
            {/* Left betting panel */}
            <div className="game-card rounded-xl p-4">
              <div className="text-white mb-2">Bet Amount</div>
              <input
                type="number"
                value={leftBetAmount}
                onChange={(e) => setLeftBetAmount(Number.parseFloat(e.target.value) || 0)}
                className="w-full bet-input mb-3 text-center"
                min="0"
                step="0.01"
                placeholder="0.00"
                disabled={leftPanelActive}
              />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button onClick={() => handleLeftQuickBet(5)} className="bet-button" disabled={leftPanelActive}>
                  $5
                </button>
                <button onClick={() => handleLeftQuickBet(10)} className="bet-button" disabled={leftPanelActive}>
                  $10
                </button>
                <button onClick={() => handleLeftQuickBet(75)} className="bet-button" disabled={leftPanelActive}>
                  $75
                </button>
                <button onClick={() => handleLeftQuickBet(100)} className="bet-button" disabled={leftPanelActive}>
                  MAX
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  onClick={() => setIsLeftPanelAutoMode(false)}
                  className={`mode-button ${!isLeftPanelAutoMode ? "mode-button-active" : ""}`}
                  disabled={leftPanelActive}
                >
                  Manual
                </button>
                <button
                  onClick={() => setIsLeftPanelAutoMode(true)}
                  className={`mode-button ${isLeftPanelAutoMode ? "mode-button-active" : ""}`}
                  disabled={leftPanelActive}
                >
                  Auto
                </button>
              </div>

              {!isLeftPanelAutoMode ? (
                // Manual mode - only show Play button
                renderLeftPlayButton()
              ) : (
                // Auto mode - show full card with Play button, Autoplay button, and Auto Cashout controls
                <>
                  {renderLeftPlayButton()}

                  <button
                    onClick={() => setIsLeftPanelAutoplayEnabled((prev) => !prev)}
                    className={`w-full py-3 rounded-md mb-3 transition-all ${
                      isLeftPanelAutoplayEnabled ? "bg-[#fab540] text-white font-bold" : "bg-[#065f20] text-white"
                    }`}
                    disabled={leftPanelActive}
                  >
                    {isLeftPanelAutoplayEnabled ? "Autoplay Enabled" : "Autoplay"}
                  </button>
                  <AutoCashoutControl
                    isEnabled={isAutoCashoutEnabled}
                    onToggle={setIsAutoCashoutEnabled}
                    multiplier={autoCashoutMultiplier}
                    onMultiplierChange={setAutoCashoutMultiplier}
                    currentMultiplier={multiplier}
                    gameState={gameState}
                  />
                </>
              )}
            </div>

            {/* Center panel - Bet History */}
            <div className="col-span-1">
              <div className="h-full">
                <BetHistory
                  betHistory={betHistory}
                  totalWins={totalWins}
                  totalLosses={totalLosses}
                  totalProfit={totalProfit}
                  biggestWin={biggestWin}
                  biggestLoss={biggestLoss}
                />
              </div>
            </div>

            {/* Right betting panel */}
            <div className="game-card rounded-xl p-4 relative">
              <div className="text-white mb-2">Bet Amount</div>
              <input
                type="number"
                value={rightBetAmount}
                onChange={(e) => setRightBetAmount(Number.parseFloat(e.target.value) || 0)}
                className="w-full bet-input mb-3 text-center"
                min="0"
                step="0.01"
                placeholder="0.00"
                disabled={rightPanelActive}
              />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button onClick={() => handleRightQuickBet(5)} className="bet-button" disabled={rightPanelActive}>
                  $5
                </button>
                <button onClick={() => handleRightQuickBet(10)} className="bet-button" disabled={rightPanelActive}>
                  $10
                </button>
                <button onClick={() => handleRightQuickBet(75)} className="bet-button" disabled={rightPanelActive}>
                  $75
                </button>
                <button onClick={() => handleRightQuickBet(100)} className="bet-button" disabled={rightPanelActive}>
                  MAX
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  onClick={() => setIsRightPanelAutoMode(false)}
                  className={`mode-button ${!isRightPanelAutoMode ? "mode-button-active" : ""}`}
                  disabled={rightPanelActive}
                >
                  Manual
                </button>
                <button
                  onClick={() => setIsRightPanelAutoMode(true)}
                  className={`mode-button ${isRightPanelAutoMode ? "mode-button-active" : ""}`}
                  disabled={rightPanelActive}
                >
                  Auto
                </button>
              </div>

              {!isRightPanelAutoMode ? (
                // Manual mode - only show Play button
                renderRightPlayButton()
              ) : (
                // Auto mode - show full card with Play button, Autoplay button, and Auto Cashout controls
                <>
                  {renderRightPlayButton()}

                  <button
                    onClick={() => setIsRightPanelAutoplayEnabled((prev) => !prev)}
                    className={`w-full py-3 rounded-md mb-3 transition-all ${
                      isRightPanelAutoplayEnabled ? "bg-[#fab540] text-white font-bold" : "bg-[#065f20] text-white"
                    }`}
                    disabled={rightPanelActive}
                  >
                    {isRightPanelAutoplayEnabled ? "Autoplay Enabled" : "Autoplay"}
                  </button>
                  <AutoCashoutControl
                    isEnabled={isAutoCashoutEnabled}
                    onToggle={setIsAutoCashoutEnabled}
                    multiplier={autoCashoutMultiplier}
                    onMultiplierChange={setAutoCashoutMultiplier}
                    currentMultiplier={multiplier}
                    gameState={gameState}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
