# AgentSphere Project Summary

**Project Name:** AgentSphere (Full Web Management, US)

## Current State & Features Developed

- **Agent Deployment System:** Users can deploy AI/AR agents with location, type, description, and interaction methods (text, voice, video, DeFi).
- **Wallet Integration:** Supports EVM wallet connection (MetaMask, etc.), with HBAR and stablecoin payments (USDT, USDC, etc.) on supported networks.
- **MCP Integrations:** Agents can be linked to Model Context Protocol (MCP) services (filesystem, memory, search, database, automation, communication, etc.).
- **Supabase Backend:** All agent deployments, user data, and configuration are stored in a Supabase Postgres database.
- **UI/UX:** Modern React/TypeScript frontend with framer-motion animations, Tailwind CSS, and Lucide icons.
- **QR Code & Payment:** QR code generation for agent payments, EIP-681 support for wallet compatibility.
- **RBAC & Security:** Row-level security and policies in Supabase for safe data access.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide icons, framer-motion
- **Backend:** Supabase (Postgres, Auth, Storage, Edge Functions)
- **Wallets:** EVM (MetaMask), Hedera Testnet (HBAR), BlockDAG, Stablecoins
- **Other:** Node.js, npm, A-Frame (for AR), custom hooks/services

## Relation to AR Viewer App

- The AR Viewer app is a 3D/AR frontend (A-Frame/WebXR) that visualizes deployed agents in real-world or virtual locations.
- **Integration:** AgentSphere’s deployment data (location, type, wallet, MCP integrations, etc.) is consumed by the AR Viewer to render and interact with agents in AR.
- **Data Flow:** When an agent is deployed via AgentSphere, its data is stored in Supabase and made available to the AR Viewer app for real-time visualization and interaction.
- **Link:** The AR Viewer app is a separate but tightly coupled frontend, sharing the same Supabase backend and agent schema.

## Summary for AI Agent

AgentSphere is a full-stack web platform for deploying, managing, and visualizing AI/AR agents with wallet-based payments and rich integrations. It uses React/TypeScript for the frontend, Supabase for the backend, and supports seamless AR visualization via the AR Viewer app, which consumes the same agent data for immersive experiences.
