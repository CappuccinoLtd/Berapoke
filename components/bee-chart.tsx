"use client"
import { useEffect, useRef } from "react"

interface BeeChartProps {
  gameState: "waiting" | "playing" | "crashed"
  multiplier: number
  maxMultiplier: number
  countdown: number
}

export function BeeChart({ gameState, multiplier, maxMultiplier, countdown }: BeeChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trailPoints = useRef<{ x: number; y: number }[]>([])
  const animationFrameRef = useRef<number>(0)

  // Use refs instead of state to avoid re-renders
  const beePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const beeAngleRef = useRef<number>(0)
  const beeImageRef = useRef<HTMLImageElement | null>(null)
  const beeLoadedRef = useRef<boolean>(false)

  // Load bee image
  useEffect(() => {
    const beeImage = new Image()
    beeImage.src = "/bee.png"
    beeImage.crossOrigin = "anonymous"
    beeImage.onload = () => {
      beeImageRef.current = beeImage
      beeLoadedRef.current = true
    }
    return () => {
      beeImageRef.current = null
      beeLoadedRef.current = false
    }
  }, [])

  // Draw the chart
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Animation function to continuously update the canvas
    const animate = () => {
      // Set canvas dimensions
      canvas.width = 300
      canvas.height = 250

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
      ctx.lineWidth = 1

      // Horizontal grid lines with multiplier labels
      const multiplierLevels = [100, 500, 750, 999]
      const gridHeight = canvas.height - 40 // Leave space at bottom

      multiplierLevels.forEach((level) => {
        const y = gridHeight - gridHeight * (level / 1000)

        // Grid line
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()

        // Label
        ctx.fillStyle = "#FFFFFF"
        ctx.font = "bold 16px Arial"
        ctx.textAlign = "left"
        ctx.fillText(`${level}x`, 10, y + 5)

        // Dotted line to right edge
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(60, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
        ctx.setLineDash([])
      })

      // Base line
      ctx.beginPath()
      ctx.moveTo(0, canvas.height - 20)
      ctx.lineTo(canvas.width, canvas.height - 20)
      ctx.stroke()

      // Only draw bee and trail during playing state
      if (gameState === "playing") {
        // Calculate positions based on multiplier
        const normalizedMultiplier = Math.min(multiplier, 1000) / 1000

        // Start from bottom left and curve upward
        const startX = 20
        const startY = canvas.height - 20

        // Calculate current position on the curve
        // This creates a path that curves upward and slightly to the right
        const progress = normalizedMultiplier

        // Calculate a curved path that starts from bottom left
        // and curves upward with a slight bend to the right
        const curveX = startX + canvas.width * 0.8 * progress

        // Use a cubic function for the y-coordinate to create a curved path
        // that initially rises slowly, then more steeply
        const curveY = startY - (canvas.height - 40) * Math.pow(progress, 1.2)

        // Add point to trail
        if (multiplier > 1.0) {
          trailPoints.current.push({ x: curveX, y: curveY })
          // Limit trail length
          if (trailPoints.current.length > 100) {
            trailPoints.current.shift()
          }
        }

        // Draw trail
        if (trailPoints.current.length > 1) {
          ctx.beginPath()
          ctx.moveTo(startX, startY)

          // Draw curve through points
          for (let i = 0; i < trailPoints.current.length; i++) {
            const point = trailPoints.current[i]
            ctx.lineTo(point.x, point.y)
          }

          // Create gradient for trail - from transparent to bright orange
          const gradient = ctx.createLinearGradient(
            startX,
            startY,
            trailPoints.current.length > 0 ? trailPoints.current[trailPoints.current.length - 1].x : startX,
            trailPoints.current.length > 0 ? trailPoints.current[trailPoints.current.length - 1].y : startY,
          )
          gradient.addColorStop(0, "rgba(250, 181, 64, 0.1)")
          gradient.addColorStop(0.5, "rgba(250, 181, 64, 0.5)")
          gradient.addColorStop(1, "rgba(250, 181, 64, 0.9)")

          ctx.strokeStyle = gradient
          ctx.lineWidth = 8
          ctx.lineCap = "round"
          ctx.lineJoin = "round"
          ctx.stroke()
        }

        // Update bee position using refs instead of state
        if (trailPoints.current.length > 0) {
          const lastPoint = trailPoints.current[trailPoints.current.length - 1]
          beePositionRef.current = { x: lastPoint.x, y: lastPoint.y }

          // Calculate bee angle based on the direction of movement
          if (trailPoints.current.length > 1) {
            const prevPoint = trailPoints.current[trailPoints.current.length - 2]
            const angle = Math.atan2(lastPoint.y - prevPoint.y, lastPoint.x - prevPoint.x)
            beeAngleRef.current = angle
          }
        } else {
          beePositionRef.current = { x: startX, y: startY }
          beeAngleRef.current = 0
        }

        // Draw bee at the end of the trail
        if (beeImageRef.current && beeLoadedRef.current) {
          const beeSize = 30

          // Save the current context state
          ctx.save()

          // Translate to the bee position
          ctx.translate(beePositionRef.current.x, beePositionRef.current.y)

          // Rotate the context based on the bee's angle of movement
          // Add 90 degrees (π/2 radians) to make the bee face the direction of movement
          ctx.rotate(beeAngleRef.current - Math.PI / 2)

          // Draw the bee image centered at the current position
          ctx.drawImage(beeImageRef.current, -beeSize / 2, -beeSize / 2, beeSize, beeSize)

          // Restore the context to its original state
          ctx.restore()
        }
      } else if (gameState === "crashed") {
        // Draw the crash trail in red
        if (trailPoints.current.length > 1) {
          ctx.beginPath()
          ctx.moveTo(20, canvas.height - 20)

          // Draw curve through points
          for (let i = 0; i < trailPoints.current.length; i++) {
            const point = trailPoints.current[i]
            ctx.lineTo(point.x, point.y)
          }

          ctx.strokeStyle = "rgba(255, 0, 0, 0.8)"
          ctx.lineWidth = 8
          ctx.lineCap = "round"
          ctx.lineJoin = "round"
          ctx.stroke()
        }

        // Draw crashed bee
        if (beeImageRef.current && beeLoadedRef.current && trailPoints.current.length > 0) {
          const beeSize = 30
          const lastPoint = trailPoints.current[trailPoints.current.length - 1]

          ctx.save()
          ctx.translate(lastPoint.x, lastPoint.y)

          // Make the bee appear "crashed" by rotating it
          ctx.rotate(Math.PI) // 180 degrees rotation

          ctx.drawImage(beeImageRef.current, -beeSize / 2, -beeSize / 2, beeSize, beeSize)
          ctx.restore()
        }
      } else if (gameState === "waiting") {
        // Reset trail points when waiting
        trailPoints.current = []

        // Draw "Next Round" text with countdown
        ctx.fillStyle = "#FFFFFF"
        ctx.font = "bold 18px Arial"
        ctx.textAlign = "center"
        ctx.fillText("Next Round", canvas.width / 2, canvas.height / 2 - 15)

        // Draw countdown with milliseconds
        ctx.font = "bold 24px Arial"
        ctx.fillText(`${countdown.toFixed(2)}s`, canvas.width / 2, canvas.height / 2 + 20)

        // Draw bee at starting position
        if (beeImageRef.current && beeLoadedRef.current) {
          const beeSize = 30
          const startX = 20
          const startY = canvas.height - 20

          ctx.save()
          ctx.translate(startX, startY)

          // Make the bee face upward and to the right
          ctx.rotate(-Math.PI / 4) // -45 degrees

          ctx.drawImage(beeImageRef.current, -beeSize / 2, -beeSize / 2, beeSize, beeSize)
          ctx.restore()
        }
      }

      // Continue the animation loop
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Start the animation loop
    animate()

    // Clean up
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameState, multiplier, maxMultiplier, countdown])

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
