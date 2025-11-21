#!/bin/bash

# Travel Agent x402 MCP - Quick Start Script
# This script sets up and tests the Travel Agent with Flightradar24 integration

set -e  # Exit on error

echo "🚀 Travel Agent x402 MCP - Quick Start"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo -e "${BLUE}Step 1: Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"
echo ""

# Step 2: Navigate to Travel Agent template
echo -e "${BLUE}Step 2: Setting up Travel Agent template...${NC}"

cd tools/travel-agent-template || {
    echo -e "${RED}❌ Directory tools/travel-agent-template not found${NC}"
    exit 1
}

echo -e "${GREEN}✅ In travel-agent-template directory${NC}"
echo ""

# Step 3: Install dependencies
echo -e "${BLUE}Step 3: Installing dependencies...${NC}"

if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Dependencies already installed (skipping)${NC}"
fi
echo ""

# Step 4: Create .env file if doesn't exist
echo -e "${BLUE}Step 4: Configuring environment...${NC}"

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from template...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
    echo ""
    echo -e "${YELLOW}📝 IMPORTANT: Edit .env file with your credentials:${NC}"
    echo "   - AGENT_ACCOUNT_ID (your Hedera account)"
    echo "   - AGENT_PRIVATE_KEY (your private key)"
    echo ""
    echo "Press Enter to continue after editing .env..."
    read -r
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi
echo ""

# Step 5: Verify environment variables
echo -e "${BLUE}Step 5: Verifying configuration...${NC}"

if grep -q "YOUR_ACCOUNT_ID" .env; then
    echo -e "${RED}❌ Please update AGENT_ACCOUNT_ID in .env file${NC}"
    exit 1
fi

if grep -q "YOUR_PRIVATE_KEY" .env; then
    echo -e "${RED}❌ Please update AGENT_PRIVATE_KEY in .env file${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables configured${NC}"
echo ""

# Step 6: Check MCP integration
echo -e "${BLUE}Step 6: Checking MCP integration...${NC}"

if grep -q "MCP_FLIGHTRADAR_ENABLED=true" .env; then
    echo -e "${GREEN}✅ Flightradar24 MCP enabled${NC}"
else
    echo -e "${YELLOW}⚠️  Flightradar24 MCP is disabled${NC}"
    echo "   Set MCP_FLIGHTRADAR_ENABLED=true in .env to enable"
fi
echo ""

# Step 7: Display agent configuration
echo -e "${BLUE}Step 7: Agent Configuration Summary${NC}"
echo "===================================="

# Extract values from .env
ACCOUNT_ID=$(grep "^AGENT_ACCOUNT_ID=" .env | cut -d '=' -f2)
TOKEN_ID=$(grep "^USDH_TOKEN_ID=" .env | cut -d '=' -f2)
MCP_ENABLED=$(grep "^MCP_FLIGHTRADAR_ENABLED=" .env | cut -d '=' -f2)
PORT=$(grep "^AGENT_PORT=" .env | cut -d '=' -f2)

echo "Agent Account: ${ACCOUNT_ID}"
echo "USDH Token: ${TOKEN_ID}"
echo "MCP Integration: ${MCP_ENABLED}"
echo "Server Port: ${PORT}"
echo ""

# Step 8: Ask user if they want to fund the agent
echo -e "${YELLOW}💰 Agent Balance Check${NC}"
echo "======================================"
echo "Your agent needs USDH tokens to pay for MCP queries."
echo "Recommended balance: 10-50 USDH"
echo ""
echo "Have you funded your agent account with USDH?"
echo "1) Yes, my agent has USDH"
echo "2) No, I need to fund it first"
read -p "Choice (1/2): " FUND_CHOICE

if [ "$FUND_CHOICE" = "2" ]; then
    echo ""
    echo -e "${BLUE}To fund your agent:${NC}"
    echo "1. Go to https://portal.hedera.com/"
    echo "2. Transfer USDH (Token ID: ${TOKEN_ID}) to your agent account: ${ACCOUNT_ID}"
    echo "3. Recommended amount: 10-50 USDH"
    echo ""
    echo "Press Enter when funding is complete..."
    read -r
fi

echo ""

# Step 9: Start the server
echo -e "${BLUE}Step 9: Starting Travel Agent server...${NC}"
echo "======================================"
echo ""
echo "Starting server on http://localhost:${PORT}"
echo "Press Ctrl+C to stop the server"
echo ""

# Run with --watch for auto-reload during development
if command -v node --watch &> /dev/null; then
    echo -e "${GREEN}🔄 Auto-reload enabled${NC}"
    npm run dev
else
    echo -e "${YELLOW}⚠️  Auto-reload not available (Node < 18.11)${NC}"
    npm start
fi
