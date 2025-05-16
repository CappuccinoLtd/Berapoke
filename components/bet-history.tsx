"use client"

import { useState } from "react"
import type { BetHistoryEntry } from "@/hooks/use-game-state"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BadgeCheck } from "lucide-react"

interface BetHistoryProps {
  betHistory: BetHistoryEntry[]
  totalWins: number
  totalLosses: number
  totalProfit: number
  biggestWin: number
  biggestLoss: number
}

export function BetHistory({
  betHistory,
  totalWins,
  totalLosses,
  totalProfit,
  biggestWin,
  biggestLoss,
}: BetHistoryProps) {
  const [activeTab, setActiveTab] = useState("history")

  // Format time to display only hours and minutes
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="game-card rounded-xl p-4 text-white h-full">
      <Tabs defaultValue="history" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4 betting-panel-tabs">
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-[#065f20] data-[state=active]:border-b-2 data-[state=active]:border-[#fab540]"
          >
            Bet History
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="data-[state=active]:bg-[#065f20] data-[state=active]:border-b-2 data-[state=active]:border-[#fab540]"
          >
            Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-0">
          <ScrollArea className="h-[280px] pr-4">
            {betHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No bet history yet. Place a bet to get started!</div>
            ) : (
              <div className="space-y-2">
                {betHistory.map((bet) => (
                  <div
                    key={bet.id}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      bet.outcome === "win" ? "bg-green-900/30" : "bg-red-900/30"
                    } border-l-4 ${bet.panel === "left" ? "border-blue-500" : "border-purple-500"}`}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        {bet.panel === "left" ? (
                          <span className="text-blue-400 font-bold text-xs mr-1">LEFT</span>
                        ) : (
                          <span className="text-purple-400 font-bold text-xs mr-1">RIGHT</span>
                        )}
                        <span className="text-sm text-gray-300">{formatTime(bet.timestamp)}</span>
                      </div>
                      <span className="font-bold">${bet.amount.toFixed(2)} Bet</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`font-bold ${bet.outcome === "win" ? "text-green-400" : "text-red-400"}`}>
                        {bet.outcome === "win" ? "+" : "-"}${Math.abs(bet.profit).toFixed(2)}
                      </span>
                      <div className="flex items-center text-sm">
                        <span>
                          {bet.multiplier.toFixed(2)}x {bet.outcome === "win" ? "Cashout" : "Crash"}
                        </span>
                        {bet.autoCashout && <BadgeCheck className="ml-1 h-4 w-4 text-[#fab540]" title="Auto Cashout" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="stats" className="mt-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0a1001]/80 p-3 rounded-lg">
              <div className="text-sm text-gray-300">Total Bets</div>
              <div className="text-2xl font-bold">{totalWins + totalLosses}</div>
            </div>
            <div className="bg-[#0a1001]/80 p-3 rounded-lg">
              <div className="text-sm text-gray-300">Win Rate</div>
              <div className="text-2xl font-bold">
                {totalWins + totalLosses > 0 ? `${Math.round((totalWins / (totalWins + totalLosses)) * 100)}%` : "0%"}
              </div>
            </div>
            <div className="bg-[#0a1001]/80 p-3 rounded-lg">
              <div className="text-sm text-gray-300">Total Profit</div>
              <div className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                {totalProfit >= 0 ? "+" : ""}
                {totalProfit.toFixed(2)}
              </div>
            </div>
            <div className="bg-[#0a1001]/80 p-3 rounded-lg">
              <div className="text-sm text-gray-300">Win/Loss</div>
              <div className="text-2xl font-bold">
                {totalWins}/{totalLosses}
              </div>
            </div>
            <div className="bg-[#0a1001]/80 p-3 rounded-lg">
              <div className="text-sm text-gray-300">Biggest Win</div>
              <div className="text-2xl font-bold text-green-400">
                {biggestWin > 0 ? `+${biggestWin.toFixed(2)}` : "0.00"}
              </div>
            </div>
            <div className="bg-[#0a1001]/80 p-3 rounded-lg">
              <div className="text-sm text-gray-300">Biggest Loss</div>
              <div className="text-2xl font-bold text-red-400">
                {biggestLoss > 0 ? `-${biggestLoss.toFixed(2)}` : "0.00"}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
