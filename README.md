# V0 – Crash Mechanics Prototype

This is a minimal prototype of a Crash Casino game built with Next.js 13 and Tailwind CSS. It demonstrates the core mechanics of a crash game while maintaining the existing UI design.

## Features

- **Game Mechanics**
  - Round-based gameplay with waiting and playing phases
  - Multiplier that increases until a random crash point
  - 10-second countdown between rounds with a 4-digit counter
  - Play/Cash Out button functionality

- **UI Elements**
  - Header with logo and buttons
  - Main game area with multiplier display and chart placeholder
  - Betting panels with amount input, quick-pick buttons, and mode toggles

## Getting Started

First, install dependencies:

\`\`\`bash
npm install
# or
yarn install
\`\`\`

Then, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Game Flow

1. **Between Rounds (Waiting State)**
   - 10-second countdown displayed as a 4-digit number (e.g., "0010", "0009", etc.)
   - Players can place bets for the upcoming round
   - "Play" button is active for placing bets

2. **During Round (Playing State)**
   - Multiplier starts at 1.00× and increases smoothly
   - Continues until reaching a random crash point (between 1.1× and 10.0×)
   - "Play" button changes to "Cash Out" for players with active bets

3. **On Crash**
   - Multiplier and chart area flash red
   - Players with active bets lose their wager
   - Game returns to waiting state after a brief pause

## Next Steps

This is just a V0 prototype. Future versions will include:
- Real-time chart visualization
- Bear and beehive animations
- Backend integration
- User authentication
- Persistent bet history
