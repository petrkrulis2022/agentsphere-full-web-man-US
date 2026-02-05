# Agent Deployment & Viewing System - Technical Prompt

## Overview

Build an interactive streaming platform where streamers can deploy AI agents with a pointer interface, positioning them precisely in the live stream. Viewers see these agents in real-time at the exact same positions with full state synchronization.

---

## Tech Stack

### Frontend Platform

- **React** `18.3.1` - UI framework
- **TypeScript** `5.8.2` - Type-safe development
- **Vite** `6.2.0` - Build tool & dev server

### 3D Graphics & Interaction

- **three.js** `0.164.1` - 3D graphics engine
- **@react-three/fiber** `8.16.6` - React renderer for Three.js
- **@react-three/drei** `9.105.6` - Useful R3F helpers
- **HTML5 Canvas API** - Agent overlay rendering

### Real-time & Backend

- **@supabase/supabase-js** `2.86.0` - PostgreSQL database + real-time subscriptions
- **WebRTC** - Video/audio streaming
- **WebSocket** (`ws` `8.18.0`) - Signaling server for WebRTC

### Web3 Integration

- **thirdweb** `5.114.0` - Multi-chain wallet connection (MetaMask, Coinbase, Rainbow, Rabby)
- Supported chains: Ethereum Sepolia, Base Sepolia, Hedera Testnet

### UI Components

- **lucide-react** `0.378.0` - Icon library
- **Tailwind CSS** - Utility-first styling

---

## Architecture

### Application Modes (Port-based)

```
┌─────────────────────────────────────────────────────────┐
│  Landing Page (5180)  →  Entry point & navigation       │
│  Streamer App (5181)  →  Stream broadcast + agent deploy│
│  Viewer App   (5182)  →  Watch streams + see agents     │
└─────────────────────────────────────────────────────────┘
```

### Agent Deployment Flow

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Streamer   │         │   Supabase   │         │    Viewer    │
│   (5181)     │         │  Real-time   │         │    (5182)    │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       │ 1. Click to place      │                        │
       │    agent at (x, y)     │                        │
       │                        │                        │
       │ 2. Update stream       │                        │
       │    agents[] in DB      │                        │
       ├───────────────────────>│                        │
       │                        │                        │
       │                        │ 3. Real-time update    │
       │                        │    broadcast           │
       │                        ├───────────────────────>│
       │                        │                        │
       │                        │                        │ 4. Render agent
       │                        │                        │    at same (x, y)
       │                        │                        │
```

### Data Models

#### Stream State (Supabase)

```typescript
interface Stream {
  id: string; // Unique stream ID
  streamerId: string; // Wallet address
  streamerName: string; // Display name
  title: string; // Stream title
  thumbnail: string; // Preview image
  isLive: boolean; // Live status
  viewerCount: number; // Current viewers
  coinSymbol: string; // Associated token
  marketCap: string; // Token market cap
  ath: string; // All-time high
  agents: AgentState[]; // Deployed agents
  created_at: Date;
  updated_at: Date;
}
```

#### Agent State

```typescript
interface AgentState {
  id: string; // Unique agent ID
  emoji: string; // Visual representation
  name: string; // Agent name
  personality: string; // Behavior type
  position: {
    x: number; // Screen X coordinate (0-100%)
    y: number; // Screen Y coordinate (0-100%)
  };
  isActive: boolean; // Active status
}
```

---

## Deployment & Viewing System

### Streamer Interface Features

1. **Agent Placement UI**
   - Click/tap anywhere on video stream to place agent
   - Visual pointer/crosshair for precise positioning
   - Real-time preview of agent position
   - Drag to reposition existing agents

2. **Agent Management**
   - Select agent type (personality/behavior)
   - Customize emoji representation
   - Toggle agent active/inactive state
   - Remove agents from stream

3. **Position Persistence**
   - Positions stored as percentage coordinates (0-100%)
   - Resolution-independent positioning
   - Persisted to Supabase `streams.agents` JSONB column
   - Real-time sync to all connected viewers

### Viewer Interface Features

1. **Agent Rendering**
   - Canvas overlay on video element
   - Agents appear at exact streamer-defined positions
   - Responsive to viewer's screen size (% coordinates)
   - Visual effects: glow, shadows, animations

2. **Real-time Synchronization**
   - Supabase real-time subscriptions to stream changes
   - Instant agent updates (add/move/remove)
   - WebRTC for video/audio streaming
   - WebSocket signaling for connection management

3. **Interaction**
   - Click agents to view details
   - Agent chat/interaction interface
   - Hover effects and tooltips

---

## Local Development Setup

### Environment Variables

```bash
# .env (platform directory)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
```

### Run Commands

```bash
# Install dependencies
cd platform
npm install

# Start all three apps simultaneously
npm run dev:all

# Or start individually:
npm run dev           # Landing page → http://localhost:5180
npm run dev:streamer  # Streamer app → http://localhost:5181
npm run dev:viewer    # Viewer app   → http://localhost:5182

# Start signaling server (separate terminal)
cd filter/server
npm install
npm run dev          # WebSocket server → ws://localhost:3001
```

### Testing Agent Deployment

1. Open streamer app at `http://localhost:5181`
2. Connect wallet (MetaMask recommended)
3. Start a stream with camera/screen share
4. Click anywhere on video preview to place an agent
5. Open viewer app at `http://localhost:5182`
6. Verify agent appears at same position
7. Move agent on streamer side → verify it updates on viewer side

---

## Key Implementation Details

### Agent Position Calculation

```typescript
// Convert click event to percentage coordinates
const handleAgentPlacement = (e: React.MouseEvent<HTMLDivElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;

  const newAgent: AgentState = {
    id: crypto.randomUUID(),
    emoji: selectedEmoji,
    name: agentName,
    personality: selectedPersonality,
    position: { x, y },
    isActive: true,
  };

  // Update Supabase
  await updateStreamAgents([...existingAgents, newAgent]);
};
```

### Real-time Subscription (Viewer)

```typescript
// Subscribe to stream updates
useEffect(() => {
  const channel = supabase
    .channel("stream-updates")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "streams",
        filter: `id=eq.${streamId}`,
      },
      (payload) => {
        setAgents(payload.new.agents);
      },
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [streamId]);
```

### Agent Rendering (Canvas)

```typescript
const renderAgent = (
  ctx: CanvasRenderingContext2D,
  agent: AgentState,
  canvasWidth: number,
  canvasHeight: number,
) => {
  const x = (agent.position.x / 100) * canvasWidth;
  const y = (agent.position.y / 100) * canvasHeight;

  // Glow effect
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#00ff00";

  // Emoji
  ctx.font = "48px sans-serif";
  ctx.fillText(agent.emoji, x - 24, y + 16);

  // Name label
  ctx.font = "14px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(agent.name, x - 30, y + 40);
};
```

---

## Production Deployment

### Platform (Vercel/Netlify)

```bash
# Build all apps
npm run build

# Deploy outputs:
# - dist/ → Main landing (5180 equivalent)
# - Configure environment variables in hosting dashboard
```

### Signaling Server (Render/Fly.io)

```bash
# Deploy WebSocket server
cd filter/server
npm run build

# Configure:
# - PORT=3001
# - WebSocket upgrade support
# - Health check endpoint: GET /health
```

### Database (Supabase)

- Hosted PostgreSQL with real-time enabled
- Configure Row Level Security (RLS) policies
- Enable real-time on `streams` table
- Set up database indexes for performance

---

## Required Outputs

1. **Agent Placement System**
   - Pointer/click interface for agent deployment
   - Visual feedback during placement
   - Percentage-based coordinate system

2. **Position Synchronization**
   - Real-time updates from streamer → Supabase → viewers
   - Consistent positioning across different screen sizes
   - Low-latency state propagation (<100ms)

3. **Integration Steps**
   - Supabase table schema setup
   - Real-time subscription configuration
   - WebRTC signaling flow
   - Wallet connection setup

4. **Environment Configuration**
   - All required API keys and URLs
   - CORS settings for WebSocket/WebRTC
   - Chain configurations for Web3
